import { UserNotSyncedError } from '@modules/users/domain/errors/user-not-synced.error';
import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';

@Catch(Error)
export class PostgresErrorFilter extends BaseExceptionFilter {
	private readonly logger = new Logger(PostgresErrorFilter.name);

	catch(exception: Error, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		const errCode = (exception as any)?.code || (exception as any)?.cause?.code;

		// 23503 = foreign_key_violation in PostgreSQL
		if (errCode === '23503') {
			this.logger.warn(
				`Postgres 23503 Error: Translating to UserNotSyncedError`
			);
			const userNotSynced = new UserNotSyncedError('Unknown');
			return response.status(404).json({
				statusCode: 404,
				message: userNotSynced.message,
				error: 'Not Found',
				_tag: userNotSynced._tag,
			});
		}

		// Fallback to default NestJS error handling
		super.catch(exception, host);
	}
}
