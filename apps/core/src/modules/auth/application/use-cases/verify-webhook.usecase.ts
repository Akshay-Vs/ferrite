import { err, ok, Result } from '@common/interfaces/result.interface';
import { IUseCase } from '@common/interfaces/use-case.interface';
import { RawWebhookRequest } from '@common/types/webhook-payload.type';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer, OTEL_TRACER } from '@core/tracer';
import { WebhookEnvelope } from '@ferrite/schema/common/webhook-envelope.zodschema';
import { type IWebhookAuth } from '@modules/auth/domain/ports/auth-provider.port';
import { WEBHOOK_AUTH } from '@modules/auth/domain/ports/auth-provider.tokens';
import { Inject, Injectable } from '@nestjs/common';

/**
 *  Verifies the webhook signature and transforms the raw claims into a UserWebhookEvent.
 *  @param payload - The raw HTTP envelope containing the unparsed body buffer and headers
 *  @returns A Result containing either a WebhookPayload or an error
 */
@Injectable()
export class VerifyWebhookUseCase
	implements IUseCase<RawWebhookRequest, WebhookEnvelope>
{
	constructor(
		@Inject(WEBHOOK_AUTH) private readonly webhookAuth: IWebhookAuth,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(payload: RawWebhookRequest): Promise<Result<WebhookEnvelope>> {
		return this.tracer.withSpan('use-case.verify-webhook', async () => {
			const result = await this.webhookAuth.verifyWebhook(payload);
			if (result.isErr()) {
				this.logger.error('Failed to verify webhook', result.error.stack);
				return err(result.error);
			}
			return ok(result.unwrap());
		});
	}
}
