import { AppLogger } from '@core/logger/logger.service';
import { type ArgumentsHost, Catch } from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import { ZodSerializationException } from 'nestjs-zod';
import { ZodError } from 'zod';

@Catch(ZodSerializationException)
export class ZodSerializationExceptionFilter extends BaseExceptionFilter {
	constructor(
		adapterHost: HttpAdapterHost,
		private readonly logger: AppLogger
	) {
		super(adapterHost.httpAdapter);
	}

	catch(exception: ZodSerializationException, host: ArgumentsHost) {
		const zodError = exception.getZodError();

		if (zodError instanceof ZodError) {
			this.logger.error(`ZodSerializationException: ${zodError.message}`);
		}

		super.catch(exception, host);
	}
}
