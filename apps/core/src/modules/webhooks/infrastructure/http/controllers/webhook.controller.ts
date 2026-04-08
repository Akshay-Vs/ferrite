import { WebhookGuard } from '@auth/index';
import { WebhookEvent } from '@common/decorators/webhook-event.decorator';
import { WebhookRoute } from '@common/decorators/webhook-route.decorator';
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
