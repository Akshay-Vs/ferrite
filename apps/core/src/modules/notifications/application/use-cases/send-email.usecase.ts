import { type Result } from '@common/interfaces/result.interface';
import type { IUseCase } from '@common/interfaces/use-case.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { type EmailTransitPayload } from '@ferrite/schema';
import { Inject, Injectable } from '@nestjs/common';
import { EmailTransitError } from '../../domain/errors/email-transit.error';
import {
	EMAIL_ADAPTER,
	type IEmailProvider,
} from '../../domain/ports/email-provider.port';

@Injectable()
export class SendEmailUseCase
	implements IUseCase<EmailTransitPayload, void, EmailTransitError>
{
	constructor(
		@Inject(EMAIL_ADAPTER)
		private readonly emailAdapter: IEmailProvider,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(
		payload: EmailTransitPayload
	): Promise<Result<void, EmailTransitError>> {
		return this.tracer.withSpan('use-case.send-email', async () => {
			this.logger.debug('Sending email');
			return this.emailAdapter.sendEmail(payload);
		});
	}
}
