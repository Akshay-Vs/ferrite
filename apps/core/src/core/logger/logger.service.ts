import { requestContext } from '@core/request-context/request-context';
import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { trace } from '@opentelemetry/api';
import pino, { Logger } from 'pino';
import pretty from 'pino-pretty';

/** Standard log levels supported by AppLogger, mapped to Pino's level system. */
export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'trace';

/**
 * Arbitrary structured fields attached to a log entry.
 * The `context` key is reserved for the class/module name label.
 */
export interface LogFields {
	context?: string;
	[key: string]: unknown;
}

/**
 * Per-request correlation fields automatically injected into every log line.
 *
 * - `requestId`  — unique ID for the inbound HTTP request (from AsyncLocalStorage)
 * - `userId`     — authenticated user ID when available (from AsyncLocalStorage)
 * - `traceId`    — OTel W3C trace ID; links this log to a Jaeger trace
 * - `spanId`     — OTel span ID; identifies the exact span within the trace
 *
 * Extend this interface to propagate additional cross-cutting fields such as
 * `tenantId` or `sessionId` without modifying individual call sites.
 */
export interface CorrelationContext {
	requestId?: string;
	userId?: string;
	traceId?: string;
	spanId?: string;
}

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements LoggerService {
	private readonly logger: Logger;

	/**
	 * The module/class label stamped on every log line produced by this instance.
	 * Set once via `setContext()` in the consuming class constructor.
	 */
	private context?: string;

	constructor(private readonly config: ConfigService) {
		const isDev = this.config.get<string>('NODE_ENV') !== 'production';

		/**
		 * Development stream: colorized, single-line output.
		 * Suppresses noisy internal fields (pid, hostname, ids) and formats
		 * context, requestId, and a shortened traceId suffix inline.
		 */
		const prettyStream = pretty({
			colorize: true,
			sync: true,
			translateTime: '❯ HH:MM:ss ❯❯❯ ',
			ignore:
				'pid,hostname,context,env,version,requestId,userId,traceId,spanId',
			messageFormat: (log, messageKey) => {
				const context = log.context ? `\x1b[33m [${log.context}] \x1b[0m` : '';
				const requestId = log.requestId
					? `\x1b[90m(${log.requestId})\x1b[0m`
					: '';
				// Show only the last 8 chars of the traceId for readability
				const traceId = log.traceId
					? `\x1b[36m[trace:${String(log.traceId).slice(-8)}]\x1b[0m`
					: '';
				const msg = log[messageKey];
				return [context, msg, requestId, traceId].filter(Boolean).join('  ');
			},
			customPrettifiers: {
				time: (timestamp) => `\x1b[90m${timestamp}\x1b[0m`,
			},
		});

		/**
		 * Production transport: fan-out to two targets.
		 *
		 * 1. `pino-opentelemetry-transport` — serializes log records as OTLP and
		 *    sends them to the OTel collector (→ Loki). Resource attributes are
		 *    attached here so Loki can index and filter by service identity.
		 *
		 * 2. `pino/file` (fd 1 = stdout) — emits raw JSON for container log
		 *    collectors (e.g. Fluent Bit, Datadog agent, k8s logging).
		 */
		const transport = isDev
			? prettyStream
			: pino.transport({
					targets: [
						{
							target: 'pino-opentelemetry-transport',
							options: {
								resourceAttributes: {
									'service.name':
										this.config.get<string>('SERVICE_NAME') ?? 'nestjs-app',
									'service.version': this.config.get<string>('APP_VERSION'),
									'deployment.environment': this.config.get<string>('NODE_ENV'),
								},
							},
						},
						{
							target: 'pino/file',
							options: { destination: 1 },
						},
					],
				});

		this.logger = pino(
			{
				level: this.config.get<string>('LOG_LEVEL') ?? 'info',
				base: {
					env: this.config.get<string>('NODE_ENV'),
					version: this.config.get<string>('APP_VERSION'),
				},
				timestamp: pino.stdTimeFunctions.isoTime,
				/**
				 * Redact sensitive fields before they reach any transport.
				 * Paths use dot-notation and glob patterns supported by `fast-redact`.
				 */
				redact: {
					paths: [
						'req.headers.authorization',
						'req.headers["x-api-key"]',
						'*.password',
						'*.token',
						'*.secret',
					],
					censor: '[REDACTED]',
				},
			},
			transport
		);
	}

	/**
	 * Binds a context label (typically the class name) to this logger instance.
	 * Should be called once in the constructor of the consuming class.
	 *
	 * @example
	 * constructor(private readonly logger: AppLogger) {
	 *   this.logger.setContext(UserService.name);
	 * }
	 */
	setContext(context: string): void {
		this.context = context;
	}

	// ── Correlation ───────────────────────────────────────────────────────────

	/**
	 * Assembles the correlation context for the current execution frame.
	 *
	 * Sources:
	 * - `requestId` / `userId` — read from the AsyncLocalStorage request store
	 *   populated by the request-context middleware.
	 * - `traceId` / `spanId` — read from the currently active OTel span, if any.
	 *   These fields enable Grafana's trace↔log correlation: a log line with a
	 *   `traceId` can be linked to the corresponding Jaeger trace in one click.
	 *
	 * Extend this method (or the `CorrelationContext` interface) to propagate
	 * additional cross-cutting identifiers such as `tenantId` or `sessionId`.
	 */
	protected getCorrelationContext(): CorrelationContext {
		const store = requestContext.getStore();
		const spanContext = trace.getActiveSpan()?.spanContext();

		return {
			...(store?.requestId && { requestId: store.requestId }),
			...(store?.userId && { userId: store.userId }),
			...(spanContext?.traceId && { traceId: spanContext.traceId }),
			...(spanContext?.spanId && { spanId: spanContext.spanId }),
		};
	}

	// ── Core write ────────────────────────────────────────────────────────────

	/**
	 * Internal write primitive. Merges caller-supplied fields with the current
	 * correlation context and delegates to the underlying Pino logger.
	 * All public logging methods funnel through here.
	 */
	private write(
		level: LogLevel,
		message: string,
		fields: LogFields = {}
	): void {
		this.logger[level](
			{
				...fields,
				context: fields.context ?? this.context,
				...this.getCorrelationContext(),
			},
			message
		);
	}

	// ── LoggerService interface ───────────────────────────────────────────────

	/** Logs an informational message. Satisfies the NestJS `LoggerService` interface. */
	log(message: string, context?: string): void {
		this.write('info', message, { context });
	}

	/** Logs an error with an optional stack trace. Satisfies the NestJS `LoggerService` interface. */
	error(message: string, trace?: string, context?: string): void {
		this.write('error', message, { context, trace });
	}

	/** Logs a warning. Satisfies the NestJS `LoggerService` interface. */
	warn(message: string, context?: string): void {
		this.write('warn', message, { context });
	}

	/** Logs a debug message. Satisfies the NestJS `LoggerService` interface. */
	debug(message: string, context?: string): void {
		this.write('debug', message, { context });
	}

	/** Logs a verbose/trace message. Satisfies the NestJS `LoggerService` interface. */
	verbose(message: string, context?: string): void {
		this.write('trace', message, { context });
	}

	// ── Extended helpers ──────────────────────────────────────────────────────

	/**
	 * Logs a message with arbitrary structured fields attached.
	 * Prefer this over `log()` when you need rich domain context that should be
	 * queryable in Loki (e.g. `orderId`, `amount`, `customerId`).
	 *
	 * @example
	 * this.logger.structured('info', 'Order placed', { orderId, amount, customerId });
	 */
	structured(level: LogLevel, message: string, fields: LogFields): void {
		this.write(level, message, fields);
	}

	/**
	 * Wraps an async operation, logging its completion time and outcome.
	 * Emits an `info` log on success and an `error` log on failure, both
	 * including a `durationMs` field for latency tracking in Grafana.
	 * The original error is always re-thrown so callers retain full control.
	 *
	 * @param label  — a dot-namespaced identifier for the operation, e.g. `db.findUser`
	 * @param fn     — the async operation to execute and measure
	 * @param context — optional context override for this measurement log
	 *
	 * @example
	 * const user = await this.logger.measure('db.findUser', () => this.repo.findById(id));
	 */
	async measure<T>(
		label: string,
		fn: () => Promise<T>,
		context?: string
	): Promise<T> {
		const start = performance.now();
		try {
			const result = await fn();
			const durationMs = Math.round(performance.now() - start);
			this.write('info', `${label} completed`, { label, durationMs, context });
			return result;
		} catch (err) {
			const durationMs = Math.round(performance.now() - start);
			this.write('error', `${label} failed`, { label, durationMs, context });
			throw err;
		}
	}
}
