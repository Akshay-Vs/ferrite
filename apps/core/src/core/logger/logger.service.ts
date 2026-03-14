import { requestContext } from '@core/request-context/request-context';
import {
	Injectable,
	LoggerService,
	OnModuleDestroy,
	Scope,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { trace } from '@opentelemetry/api';
import pino, { Logger } from 'pino';
import pretty from 'pino-pretty';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'trace';

export interface LogFields {
	context?: string;
	[key: string]: unknown;
}

/**
 * Extend this interface to add more correlation fields over time.
 * e.g. tenantId, sessionId, etc.
 */
export interface CorrelationContext {
	requestId?: string;
	userId?: string;
	traceId?: string;
	spanId?: string;
}

// ── Loki HTTP transport ────────────────────────────────────────────────────

interface LokiStream {
	stream: Record<string, string>;
	values: [string, string][];
}

interface LokiPushPayload {
	streams: LokiStream[];
}

/**
 * Minimal, self-contained Loki push client.
 *
 * Batches log entries and flushes them either when the batch reaches
 * BATCH_SIZE or when the FLUSH_INTERVAL_MS timer fires — whichever
 * comes first.  On process shutdown, call flush() to drain the buffer.
 *
 * Label cardinality rules (Loki hard requirement):
 *   - All label values MUST be plain strings.
 *   - Keep the label set small and low-cardinality (app + env only).
 *   - Per-entry fields (level, requestId, traceId …) go in the log line
 *     body as structured JSON, NOT as stream labels.
 */
class LokiTransport implements OnModuleDestroy {
	private readonly lokiUrl: string;
	private readonly staticLabels: Record<string, string>;
	private readonly batch: [string, string][] = [];

	private readonly BATCH_SIZE = 100;
	private readonly MAX_BATCH_SIZE = 1024;
	private readonly FLUSH_INTERVAL_MS = 2_000;
	private flushTimer: ReturnType<typeof setInterval> | null = null;

	constructor(lokiUrl: string, staticLabels: Record<string, string>) {
		this.lokiUrl = `${lokiUrl}/loki/api/v1/push`;
		// Guarantee every label value is a plain string — Loki will reject
		// anything that serialises to a non-string JSON value.
		this.staticLabels = Object.fromEntries(
			Object.entries(staticLabels).map(([k, v]) => [k, String(v)])
		);
		this.flushTimer = setInterval(
			() => void this.flush(),
			this.FLUSH_INTERVAL_MS
		);
		// Allow Node to exit without waiting for the timer.
		this.flushTimer.unref?.();
	}

	/** Called by NestJS lifecycle when the module is torn down. */
	onModuleDestroy(): void {
		if (this.flushTimer) {
			clearInterval(this.flushTimer);
			this.flushTimer = null;
		}
		void this.flush();
	}

	push(line: string): void {
		// Loki timestamp must be a nanosecond-precision Unix epoch string.
		const tsNs = String(Date.now() * 1_000_000);
		this.batch.push([tsNs, line]);
		if (this.batch.length >= this.BATCH_SIZE) {
			void this.flush();
		}
	}

	async flush(): Promise<void> {
		if (this.batch.length === 0) return;

		// Drain the batch atomically so a concurrent flush doesn't double-send.
		const entries = this.batch.splice(0, this.batch.length);

		const payload: LokiPushPayload = {
			streams: [
				{
					stream: this.staticLabels,
					values: entries,
				},
			],
		};

		try {
			const res = await fetch(this.lokiUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			if (!res.ok) {
				const body = await res.text().catch(() => '<unreadable>');
				// Write to stderr directly — do NOT use the logger here to avoid
				// infinite recursion.
				process.stderr.write(
					`[LokiTransport] push failed ${res.status}: ${body}\n`
				);
				// Re-queue entries so they are not silently dropped.
				if (this.batch.length + entries.length <= this.MAX_BATCH_SIZE) {
					this.batch.unshift(...entries);
				} else {
					process.stderr.write(
						`[LokiTransport] dropping ${entries.length} entries (buffer full)\n`
					);
				}
			}
		} catch (err) {
			process.stderr.write(
				`[LokiTransport] network error: ${(err as Error).message}\n`
			);
			// Re-queue on network error as well.
			if (this.batch.length + entries.length <= this.MAX_BATCH_SIZE) {
				this.batch.unshift(...entries);
			} else {
				process.stderr.write(
					`[LokiTransport] dropping ${entries.length} entries (buffer full)\n`
				);
			}
		}
	}
}

// ── Logger service ─────────────────────────────────────────────────────────

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements LoggerService, OnModuleDestroy {
	private readonly logger: Logger;
	private readonly lokiTransport: LokiTransport | null = null;
	private context?: string;

	constructor(private readonly config: ConfigService) {
		const lokiUrl = this.config.get<string>('LOKI_URL');
		const appName = this.config.get<string>('APP_NAME') ?? 'app';
		const appVersion = this.config.get<string>('APP_VERSION');
		const nodeEnv = this.config.get<string>('NODE_ENV') ?? 'development';

		// ── TTY stream (colorised, human-readable) ──────────────────────────
		const ttyStream = pretty({
			colorize: true,
			sync: true,
			translateTime: '❯ HH:MM:ss ❯❯❯ ',
			ignore:
				'pid,hostname,context,env,version,requestId,userId,traceId,spanId',
			messageFormat: (log, messageKey) => {
				const context = log.context ? `\x1b[33m [${log.context}] \x1b[0m` : '';
				const requestId = log.requestId
					? `\x1b[90m(req:${log.requestId})\x1b[0m`
					: '';
				const traceId = log.traceId
					? `\x1b[36m(trace:${String(log.traceId).slice(-8)})\x1b[0m`
					: '';
				const msg = log[messageKey];
				return [context, msg, requestId, traceId].filter(Boolean).join('  ');
			},
			customPrettifiers: {
				time: (timestamp) => `\x1b[90m${timestamp}\x1b[0m`,
			},
		});

		// ── Loki transport (direct HTTP, no pino-loki) ──────────────────────
		if (lokiUrl) {
			this.lokiTransport = new LokiTransport(lokiUrl, {
				app: appName,
				env: nodeEnv,
			});
		}

		// ── Pino writes to TTY only; Loki is handled by LokiTransport ───────
		this.logger = pino(
			{
				level: config.get<string>('LOG_LEVEL') ?? 'info',
				base: {
					env: nodeEnv,
					version: appVersion,
				},
				formatters: {
					level(label) {
						return { level: label };
					},
				},
				timestamp: pino.stdTimeFunctions.isoTime,
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
			ttyStream
		);
	}

	onModuleDestroy(): void {
		this.lokiTransport?.onModuleDestroy();
	}

	/**
	 * Set the context (usually the class name) for all subsequent log calls.
	 * Call once in the constructor of each consuming class.
	 */
	setContext(context: string): void {
		this.context = context;
	}

	// ── Correlation ────────────────────────────────────────────────────────

	protected getCorrelationContext(): CorrelationContext {
		const store = requestContext.getStore();

		const activeSpan = trace.getActiveSpan();
		const spanContext = activeSpan?.spanContext();
		const isValidSpan = spanContext && trace.isSpanContextValid(spanContext);

		return {
			...(store?.requestId && { requestId: store.requestId }),
			...(store?.userId && { userId: store.userId }),
			...(isValidSpan && {
				traceId: spanContext!.traceId,
				spanId: spanContext!.spanId,
			}),
		};
	}

	// ── Core write ─────────────────────────────────────────────────────────

	private write(
		level: LogLevel,
		message: string,
		fields: LogFields = {}
	): void {
		const merged = {
			...fields,
			context: fields.context ?? this.context ?? '',
			...this.getCorrelationContext(),
		};

		// Write to TTY via pino.
		this.logger[level](merged, message);

		// Write to Loki via direct HTTP transport.
		// Serialise the full structured log line as JSON — identical shape to
		// what pino would emit, so Grafana queries work the same way.
		if (this.lokiTransport) {
			const line = JSON.stringify({
				level,
				msg: message,
				time: new Date().toISOString(),
				...merged,
			});
			this.lokiTransport.push(line);
		}
	}

	// ── LoggerService interface ────────────────────────────────────────────

	log(message: string, context?: string): void {
		this.write('info', message, { context });
	}

	error(message: string, trace?: string, context?: string): void {
		this.write('error', message, { context, trace });
	}

	warn(message: string, context?: string): void {
		this.write('warn', message, { context });
	}

	debug(message: string, context?: string): void {
		this.write('debug', message, { context });
	}

	verbose(message: string, context?: string): void {
		this.write('trace', message, { context });
	}

	// ── Extended helpers ───────────────────────────────────────────────────

	/**
	 * Log with arbitrary structured fields.
	 * Prefer this over log() when you need rich domain context.
	 *
	 * @example
	 * this.logger.structured('info', 'Order placed', { orderId, amount });
	 */
	structured(level: LogLevel, message: string, fields: LogFields): void {
		this.write(level, message, fields);
	}

	/**
	 * Measure and log execution time of any async operation.
	 *
	 * @example
	 * const user = await this.logger.measure('db.findUser', () => repo.findById(id));
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
