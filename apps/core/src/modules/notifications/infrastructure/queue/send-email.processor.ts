import { err, ok, Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { BaseProcessor } from '@core/processor';
import { GraphileProcessor } from '@core/processor/decorators/graphile-processor.decorator';
import { type ITracer, OTEL_TRACER } from '@core/tracer';
import {
	EventPayload,
	eventPayloadSchema,
} from '@ferrite/schema/common/event-payload.zodschema';
import { EmailTransitPayloadSchema } from '@ferrite/schema/notification/email.zodschema';
import { Inject } from '@nestjs/common';
import { EmailTransitError } from '@notifications/domain/errors/email-transit.error';
import {
	type ISendEmailUseCase,
	SEND_EMAIL_UC,
} from '@notifications/domain/ports/use-cases.port';
import type { JobHelpers } from 'graphile-worker';
import { SEND_EMAIL_QUEUE } from './queue.constraints';

@GraphileProcessor(SEND_EMAIL_QUEUE)
export class SendEmailQueueProcessor extends BaseProcessor<EventPayload> {
	constructor(
		protected readonly logger: AppLogger,
		@Inject(SEND_EMAIL_UC) private readonly sendEmail: ISendEmailUseCase,
		@Inject(OTEL_TRACER) private readonly otelTracer: ITracer
	) {
		super(logger);
		this.logger.setContext(this.constructor.name);
	}

	protected async handle(
		payload: EventPayload,
		_helpers?: JobHelpers
	): Promise<Result<void, EmailTransitError>> {
		return this.otelTracer.withSpan(
			'SendEmailQueueProcessor.handle',
			async () => {
				// Validate the graphile envelope
				const validatedEnvelope = eventPayloadSchema.safeParse(payload);
				if (!validatedEnvelope.success) {
					this.logger.error(
						`Poison Pill Envelope: ${validatedEnvelope.error.message}`
					);
					return ok(); // ack poison pill
				}

				// validate EmailTransitPayload
				const validatedEmailPayload = EmailTransitPayloadSchema.safeParse(
					validatedEnvelope.data.payload
				);
				if (!validatedEmailPayload.success) {
					this.logger.error(
						`Poison Pill Payload: ${validatedEmailPayload.error.message}`
					);
					return ok(); // ack poison pill
				}

				// Delegate to SendEmailUseCase
				const result = await this.sendEmail.execute(validatedEmailPayload.data);

				if (result.isErr()) {
					this.logger.error(
						`Failed to send email to ${validatedEmailPayload.data.recipient}: ${result.error}`
					);

					return err(result.error);
				}

				this.logger.debug(
					`Email sent to ${validatedEmailPayload.data.recipient} (eventId=${validatedEnvelope.data.eventId})`
				);
				return ok();
			}
		);
	}
}
