import { err, ok, Result } from '@common/interfaces/result.interface';
import { WebhookEnvelope } from '@common/schemas/webhook-envelope.zodschema';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer, OTEL_TRACER } from '@core/tracer';
import { Inject, Injectable } from '@nestjs/common';
import {
	type IWebhookRepository,
	WEBHOOK_REPOSITORY,
} from '@webhooks/domain/ports/webhook-repository.port';
import { IPersistWebhook } from '@webhooks/domain/ports/webhook-usecase.port';

@Injectable()
export class PersistWebhookUsecase implements IPersistWebhook {
	constructor(
		private readonly logger: AppLogger,
		@Inject(WEBHOOK_REPOSITORY) private readonly repo: IWebhookRepository,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(payload: WebhookEnvelope): Promise<Result<boolean, Error>> {
		return this.tracer.withSpan(
			'use-case.persist-webhook',
			async () => {
				try {
					this.logger.debug(`Persisting webhook ${payload.eventType}`);
					const res = await this.repo.persistWebhook(payload);
					return ok(res);
				} catch (error) {
					this.logger.error(
						`Failed to persist webhook: ${payload.eventType}`,
						error instanceof Error ? error.stack : String(error)
					);

					return err(new Error('Failed to persist webhook'));
				}
			},
			{
				'webhook.provider': payload.provider,
				'webhook.eventType': payload.eventType,
			}
		);
	}
}
