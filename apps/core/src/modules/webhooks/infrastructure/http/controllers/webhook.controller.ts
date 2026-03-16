import { WebhookGuard, type WebhookPayload, WebhookRoute } from '@auth/index';
import {
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	ServiceUnavailableException,
	UseGuards,
} from '@nestjs/common';
import { WebhookRouterUsecase } from '@webhooks/application/use-cases/webhook-router.usercase';
import { WebhookEvent } from '../decorators/webhook-event.decorator';

@Controller('webhooks')
@WebhookRoute()
@UseGuards(WebhookGuard)
export class WebhookController {
	constructor(private readonly webhookRouterUsecase: WebhookRouterUsecase) {}

	@Post()
	@HttpCode(HttpStatus.OK)
	async createWebhook(@WebhookEvent() event: WebhookPayload) {
		const ok = await this.webhookRouterUsecase.execute(event);
		if (!ok) {
			throw new ServiceUnavailableException('Webhook routing failed');
		}
		return { accepted: true };
	}
}
