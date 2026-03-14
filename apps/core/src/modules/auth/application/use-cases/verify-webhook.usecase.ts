import { RawWebhookClaims } from '@auth/domain/schemas';
import { err, ok, Result } from '@common/interfaces/result.interface';
import { IUseCase } from '@common/interfaces/use-case.interface';
import { WebhookPayload } from '@common/types/webhook-payload.type';
import { AppLogger } from '@core/logger/logger.service';
import { type IWebhookAuth } from '@modules/auth/domain/ports/auth-provider.port';
import { WEBHOOK_AUTH } from '@modules/auth/domain/ports/auth-provider.tokens';
import { Inject, Injectable } from '@nestjs/common';

/**
 *  Verifies the webhook signature and transforms the raw claims into a UserWebhookEvent.
 *  @param payload - The raw HTTP envelope containing the unparsed body buffer and headers
 *  @returns A Result containing either a UserWebhookEvent or an error
 */
@Injectable()
export class VerifyWebhookUseCase
	implements IUseCase<WebhookPayload, RawWebhookClaims>
{
	constructor(
		@Inject(WEBHOOK_AUTH) private readonly webhookAuth: IWebhookAuth,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(payload: WebhookPayload): Promise<Result<RawWebhookClaims>> {
		try {
			const claims = await this.webhookAuth.verifyWebhook(payload);
			return ok(claims);
		} catch (error) {
			this.logger.error('Failed to verify webhook');
			return err(error instanceof Error ? error : new Error(String(error)));
		}
	}
}
