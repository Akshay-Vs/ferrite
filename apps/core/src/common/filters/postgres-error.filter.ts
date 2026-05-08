import { AppLogger } from '@core/logger/logger.service';
import { UserNotSyncedError } from '@modules/users/domain/errors/user-not-synced.error';
import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PostgresError } from 'postgres';

@Catch(PostgresError)
export class PostgresErrorFilter implements ExceptionFilter {
	constructor(private readonly logger: AppLogger) {
		this.logger.setContext(PostgresErrorFilter.name);
	}

	catch(exception: PostgresError, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		const errCode = exception.code;

		// 23503 = foreign_key_violation in PostgreSQL
		if (errCode === '23503') {
			this.logger.warn(
				`Postgres 23503 Error: Translating to UserNotSyncedError`
			);
			const userNotSynced = new UserNotSyncedError('Unknown');
			return response.status(HttpStatus.NOT_FOUND).json({
				statusCode: HttpStatus.NOT_FOUND,
				message: userNotSynced.message,
				error: 'Not Found',
				_tag: userNotSynced._tag,
				path: request.url,
				timestamp: new Date().toISOString(),
			});
		}

		this.logger.error(
			`Postgres Error [${errCode}]: ${exception.message}`,
			exception.stack
		);

		// Fallback to masked internal server error to prevent leakage
		response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
			statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
			error: 'Internal Server Error',
			message: 'Something went wrong. Please try again later.',
			path: request.url,
			timestamp: new Date().toISOString(),
		});
	}
}
