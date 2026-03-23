import { OutboxModule } from '@modules/outbox/outbox.module';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { CreateUserUseCase } from './application/use-case/create-user.usecase';
import { GetOwnProfileUseCase } from './application/use-case/get-own-profile.usecase';
import { InitiateProfileUpdateUseCase } from './application/use-case/initiate-profile-update.usecase';
import { InitiateDeleteUserUseCase } from './application/use-case/initiate-user-deletion.usecase';
import { RouteUserEventsUsecase } from './application/use-case/route-user-events.usercase';
import { SyncProfileUpdateUseCase } from './application/use-case/sync-profile-update.usecase';
import { SyncUserDeletionUseCase } from './application/use-case/sync-user-deletion.usercase';
import {
	CREATE_USER_UC,
	GET_OWN_PROFILE_UC,
	INITIATE_DELETE_USER_UC,
	INITIATE_PROFILE_UPDATE_UC,
	ROUTE_USER_EVENTS_UC,
	SYNC_USER_DELETION_UC,
	SYNC_USER_UPDATE_UC,
} from './domain/ports/use-cases.port';
import { USER_REPOSITORY } from './domain/ports/user-repository.port';
import {
	IWebhookMapper,
	WEBHOOK_MAPPER,
} from './domain/ports/webhook-mapper.port';
import { WEBHOOK_MAPPER_REGISTRY } from './domain/ports/webhook-mapper.registry.port';
import { WebhookMapperRegistry } from './infrastructure/adapters/webhook-mapper-registry.adapter';
import { UserController } from './infrastructure/http/controllers/user.controller';
import { ClerkWebhookMapper } from './infrastructure/persistance/mappers/clerk-webhook.mapper';
import { DrizzleUserRepository } from './infrastructure/persistance/repositories/drizzle-user.repository';
import { USER_SYNC_QUEUE } from './infrastructure/queue/queue.constraints';
import { UserSyncWorker } from './infrastructure/queue/user-sync.worker';

@Module({
	imports: [
		OutboxModule,
		BullModule.registerQueue({
			name: USER_SYNC_QUEUE,
		}),
	],
	controllers: [UserController],
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
			provide: INITIATE_DELETE_USER_UC,
			useClass: InitiateDeleteUserUseCase,
		},
		{
			provide: SYNC_USER_DELETION_UC,
			useClass: SyncUserDeletionUseCase,
		},
		{
			provide: GET_OWN_PROFILE_UC,
			useClass: GetOwnProfileUseCase,
		},
		{
			provide: INITIATE_PROFILE_UPDATE_UC,
			useClass: InitiateProfileUpdateUseCase,
		},
		{
			provide: SYNC_USER_UPDATE_UC,
			useClass: SyncProfileUpdateUseCase,
		},
		{
			provide: ROUTE_USER_EVENTS_UC,
			useClass: RouteUserEventsUsecase,
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
