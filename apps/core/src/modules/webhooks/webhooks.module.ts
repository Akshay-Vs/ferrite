import { QueueModule } from '@modules/queue';
import { Module } from '@nestjs/common';
import { PersistWebhookUsecase } from './application/use-cases/persist-webhook.usecase';
import { WEBHOOK_REPOSITORY } from './domain/ports/webhook-repository.port';
import { PERSIST_WEBHOOK_UC } from './domain/ports/webhook-usecase.port';
import { WebhookController } from './infrastructure/http/controllers/webhook.controller';
import { WebhookRepository } from './infrastructure/persistance/repositories/webhook.repository';

@Module({
	imports: [QueueModule],
	controllers: [WebhookController],
	providers: [
		{
			provide: PERSIST_WEBHOOK_UC,
			useClass: PersistWebhookUsecase,
		},
		{
			provide: WEBHOOK_REPOSITORY,
			useClass: WebhookRepository,
		},
	],
})
export class WebhooksModule {}
