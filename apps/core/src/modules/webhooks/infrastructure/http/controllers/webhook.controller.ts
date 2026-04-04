import { WebhookGuard, WebhookRoute } from '@auth/index';
import type { WebhookEnvelope } from '@common/schemas/webhook-envelope.zodschema';
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
	async createWebhook(@WebhookEvent() event: WebhookEnvelope) {
		const ok = await this.persistWebhookUsecase.execute(event);
		if (!ok) {
			throw new ServiceUnavailableException('Webhook persistence failed');
		}
		return { accepted: true };
	}
}
