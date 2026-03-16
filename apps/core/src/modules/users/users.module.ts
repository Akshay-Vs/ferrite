import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { CreateUserUseCase } from './application/use-case/create-user.usecase';
import { DeleteUserUseCase } from './application/use-case/delete-user.usecase';
import { UpdateUserUseCase } from './application/use-case/update-user.usecase';
import {
	CREATE_USER_UC,
	DELETE_USER_UC,
	UPDATE_USER_UC,
} from './domain/ports/use-cases.port';
import { USER_REPOSITORY } from './domain/ports/user-repository.port';
import {
	IWebhookMapper,
	WEBHOOK_MAPPER,
} from './domain/ports/webhook-mapper.port';
import { WEBHOOK_MAPPER_REGISTRY } from './domain/ports/webhook-mapper.registry.port';
import { WebhookMapperRegistry } from './infrastructure/adapters/webhook-mapper-registry.adapter';
import { ClerkWebhookMapper } from './infrastructure/persistance/mappers/clerk-webhook.mapper';
import { DrizzleUserRepository } from './infrastructure/persistance/repositories/drizzle-user.repository';
import { USER_SYNC_QUEUE } from './infrastructure/queue/queue.constrains';
import { UserSyncWorker } from './infrastructure/queue/user-sync.worker';

@Module({
	imports: [
		BullModule.registerQueue({
			name: USER_SYNC_QUEUE,
		}),
	],
	providers: [
		// Repository
		{
			provide: USER_REPOSITORY,
			useClass: DrizzleUserRepository,
		},

		// Use-cases
		{
			provide: CREATE_USER_UC,
			useClass: CreateUserUseCase,
		},
		{
			provide: UPDATE_USER_UC,
			useClass: UpdateUserUseCase,
		},
		{
			provide: DELETE_USER_UC,
			useClass: DeleteUserUseCase,
		},
		{
			provide: WEBHOOK_MAPPER_REGISTRY,
			useClass: WebhookMapperRegistry,
		},
		// inject new mappers here
		{
			provide: WEBHOOK_MAPPER,
			useFactory: (clerk: ClerkWebhookMapper): IWebhookMapper[] => [clerk],
			inject: [ClerkWebhookMapper],
		},
		ClerkWebhookMapper,

		// Queue worker
		UserSyncWorker,
	],
	exports: [],
})
export class UsersModule {}
