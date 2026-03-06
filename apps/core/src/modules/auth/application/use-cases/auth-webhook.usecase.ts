// calls authProvider.verifyWebhook() → saves user → emits UserRegisteredEvent
// handles user.update, user.delete, user.register etc
// Webhook Service

import { AppLogger } from '@core/logger/logger.service';
import {
	AUTH_PROVIDER,
	type IAuthProvider,
	type WebHookEvent,
	type WebHookPayload,
} from '@modules/auth/domain/ports/auth-provider.port';
import { Inject, Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class AuthWebhookUsecase {
	constructor(
		@Inject(AUTH_PROVIDER) private authProvider: IAuthProvider,
		private logger: AppLogger
	) {}

	async execute(payload: WebHookPayload): Promise<WebHookEvent> {
		try {
			const webhook = await this.authProvider.verifyWebhook(payload);

			switch (webhook.eventType) {
				case 'user.created':
					throw new NotImplementedException('user.created not implemented');
				case 'user.updated':
					throw new NotImplementedException('user.updated not implemented');
				case 'user.deleted':
					throw new NotImplementedException('user.deleted not implemented');
				default:
					throw new Error('Invalid event type');
			}

			// return webhook;
		} catch (e) {
			this.logger.error(e);
			throw new Error('Unable to verify webhook');
		}
	}
}
