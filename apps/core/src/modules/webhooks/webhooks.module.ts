import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { USER_SYNC_QUEUE } from '@users/index';
import { WebhookRouterUsecase } from './application/use-cases/webhook-router.usercase';
import { WebhookController } from './infrastructure/http/controllers/webhook.controller';
import { UserSyncProducer } from './infrastructure/queue/user-sync.producer';

@Module({
	imports: [
		BullModule.registerQueue({
			name: USER_SYNC_QUEUE,
		}),
	],
	controllers: [WebhookController],
	providers: [WebhookRouterUsecase, UserSyncProducer],
})
export class WebhooksModule {}
