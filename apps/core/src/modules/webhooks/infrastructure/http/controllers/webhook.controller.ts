import { WebhookGuard, type WebhookPayload, WebhookRoute } from '@auth/index';
import {
	Controller,
	HttpCode,
	HttpStatus,
	Inject,
	Post,
	ServiceUnavailableException,
	UseGuards,
} from '@nestjs/common';
import {
	type IPersistWebhook,
	PERSIST_WEBHOOK_UC,
} from '@webhooks/domain/ports/webhook-usecase.port';
import { WebhookEvent } from '../decorators/webhook-event.decorator';

@Controller('webhooks')
@WebhookRoute()
@UseGuards(WebhookGuard)
export class WebhookController {
	constructor(
		@Inject(PERSIST_WEBHOOK_UC)
		private readonly persistWebhookUsecase: IPersistWebhook
	) {}

	@Post()
	@HttpCode(HttpStatus.OK)
	async createWebhook(@WebhookEvent() event: WebhookPayload) {
		const ok = await this.persistWebhookUsecase.execute(event);
		if (!ok) {
			throw new ServiceUnavailableException('Webhook routing failed');
		}
		return { accepted: true };
	}
}
