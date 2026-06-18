import { AppLogger } from '@core/logger/logger.service';
import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Catch()
export class UnhandledExceptionFilter implements ExceptionFilter {
	constructor(private readonly logger: AppLogger) {
		this.logger.setContext(UnhandledExceptionFilter.name);
	}

	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<FastifyReply>();
		const request = ctx.getRequest<FastifyRequest>();

		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		let message: any = 'Something went wrong. Please try again later.';
		let error = 'Internal Server Error';
		let extraData: Record<string, any> = {};

		if (exception instanceof HttpException) {
			status = exception.getStatus();
			const responseBody = exception.getResponse() as any;

			// Mask all server-side failures (5xx) to prevent leakage
			if (status < HttpStatus.INTERNAL_SERVER_ERROR) {
				message =
					typeof responseBody === 'string'
						? responseBody
						: responseBody.message || exception.message;
				error =
					typeof responseBody === 'object' ? responseBody.error : undefined;

				if (typeof responseBody === 'object') {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const {
						message: _msg,
						error: _err,
						statusCode: _sc,
						...rest
					} = responseBody;
					extraData = rest;
				}
			}
		}

		if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
			this.logger.error(
				`Unhandled exception [${request.method}] ${request.url}`,
				exception instanceof Error ? exception.stack : String(exception)
			);
		}

		response.status(status).send({
			...extraData,
			statusCode: status,
			error,
			message,
			path: request.url,
			timestamp: new Date().toISOString(),
		});
	}
}
