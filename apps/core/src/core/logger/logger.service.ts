import { requestContext } from '@core/request-context/request-context';
import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
}

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements LoggerService {
	private readonly logger: Logger;
	private context?: string;

	constructor(private readonly config: ConfigService) {
		const isDev = this.config.get<string>('NODE_ENV') !== 'production';

		const stream = pretty({
			colorize: true,
			sync: true,
			translateTime: '❯ HH:MM:ss ❯❯❯ ',
			ignore: 'pid,hostname,context,env,version,requestId,userId',
			messageFormat: (log, messageKey) => {
				const context = log.context ? `\x1b[33m [${log.context}] \x1b[0m` : '';
				const requestId = log.requestId
					? `\x1b[90m(${log.requestId})\x1b[0m`
					: '';
				const msg = log[messageKey];

				return [context, msg, requestId].filter(Boolean).join('  ');
			},
			customPrettifiers: {
				time: (timestamp) => `\x1b[90m${timestamp}\x1b[0m`, // gray timestamp
			},
		});
		this.logger = pino(
			{
				level: config.get<string>('LOG_LEVEL') ?? 'info',
				base: {
					env: config.get<string>('NODE_ENV'),
					version: config.get<string>('APP_VERSION'),
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
			isDev ? stream : undefined
		);
	}

	/**
	 * Set the context (usually the class name) for all subsequent log calls.
	 * Call once in the constructor of each consuming class.
	 */
	setContext(context: string): void {
		this.context = context;
	}

	// Correlation
	// Single place to extend when you add OTel, session IDs, tenant IDs, etc.

	protected getCorrelationContext(): CorrelationContext {
		const store = requestContext.getStore();
		return {
			...(store?.requestId && { requestId: store.requestId }),
			...(store?.userId && { userId: store.userId }),
		};
	}

	// Core write

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

	// LoggerService interface

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

	// Extended helpers

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
