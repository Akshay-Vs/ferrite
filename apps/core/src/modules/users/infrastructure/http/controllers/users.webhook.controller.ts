import { type WebhookPayload } from '@common/types/webhook-payload.type';
import { AppLogger } from '@core/logger/logger.service';
import { WebhookRoute } from '@modules/auth/infrastructure/http/decorators/webhook-route.decorator';
import { WebhookGuard } from '@modules/auth/infrastructure/http/guards/webhook.guard';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';

@Controller('users/webhook')
@UseGuards(WebhookGuard)
export class UsersWebhookController {
	constructor(private readonly logger: AppLogger) {}

	@Post()
	@WebhookRoute()
	async handleWebhook(@Body() payload: WebhookPayload) {
		this.logger.debug(JSON.stringify(payload, null, 2));
		this.logger.debug('UsersWebhookController.handleWebhook');
		return 'ok';
	}
}
