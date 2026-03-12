import { Module } from '@nestjs/common';
import { UsersWebhookController } from './infrastructure/http/controllers/users.webhook.controller';

@Module({
	imports: [],
	controllers: [UsersWebhookController],
	exports: [],
})
export class UsersModule {}
