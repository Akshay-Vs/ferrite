import { WebhookPayload } from '@auth/index';
import { userEventsSchema } from '@common/events/user-events.zodschema';
import { ok, Result } from '@common/interfaces/result.interface';
import { IUseCase } from '@common/interfaces/use-case.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { Inject, Injectable } from '@nestjs/common';
import {
	type IUserSyncProducer,
	USER_SYNC_PRODUCER,
} from '@webhooks/domain/ports/user-sync-producer.port';

@Injectable()
export class WebhookRouterUsecase implements IUseCase<WebhookPayload, boolean> {
	constructor(
		private readonly logger: AppLogger,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		@Inject(USER_SYNC_PRODUCER)
		private readonly userSyncProducer: IUserSyncProducer
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(payload: WebhookPayload): Promise<Result<boolean, Error>> {
		return this.tracer.withSpan(
			'use-case.webhook-router',
			async () => {
				const eventType = payload.eventType;

				if (!userEventsSchema.safeParse(eventType).success) {
					this.logger.debug(`Ignoring unsupported eventType: ${eventType}`);
					return ok(true);
				}

				this.logger.debug(`Enqueueing user event ${eventType}`);
				await this.userSyncProducer.enqueue(payload, eventType);
				return ok(true);
			},
			{
				'webhook.provider': payload.provider,
				'webhook.eventType': payload.eventType,
			}
		);
	}
}
