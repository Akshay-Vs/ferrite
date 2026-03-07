// calls authProvider.verifyWebhook() → saves user → emits UserRegisteredEvent
// handles user.update, user.delete, user.register etc
// Webhook Service

import { AppLogger } from '@core/logger/logger.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthWebhookUsecase {
	constructor(private logger: AppLogger) {
		this.logger.setContext(AuthWebhookUsecase.name);
	}
}
