import { QueueModule } from '@modules/queue';
import { Module } from '@nestjs/common';
import { CreateUserUseCase } from './application/use-case/create-user.usecase';
import { GetAllUsersUseCase } from './application/use-case/get-all-users.usecase';
import { GetOwnProfileUseCase } from './application/use-case/get-own-profile.usecase';
import { GetUserByIdUseCase } from './application/use-case/get-user-by-id.usecase';
import { InitiateProfileUpdateUseCase } from './application/use-case/initiate-profile-update.usecase';
import { InitiateRoleUpdateUseCase } from './application/use-case/initiate-role-update.usecase';
import { InitiateDeleteUserUseCase } from './application/use-case/initiate-user-deletion.usecase';
import { RouteUserEventsUsecase } from './application/use-case/route-user-events.usercase';
import { SyncProfileUpdateUseCase } from './application/use-case/sync-profile-update.usecase';
import { SyncUserDeletionUseCase } from './application/use-case/sync-user-deletion.usercase';
import {
	CREATE_USER_UC,
	GET_ALL_USERS_UC,
	GET_OWN_PROFILE_UC,
	GET_USER_BY_ID_UC,
	INITIATE_DELETE_USER_UC,
	INITIATE_PROFILE_UPDATE_UC,
	INITIATE_ROLE_UPDATE_UC,
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
import { UserSyncProcessor } from './infrastructure/queue/user-sync.processor';

@Module({
	imports: [QueueModule],
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
			provide: GET_ALL_USERS_UC,
			useClass: GetAllUsersUseCase,
		},
		{
			provide: GET_USER_BY_ID_UC,
			useClass: GetUserByIdUseCase,
		},
		{
			provide: INITIATE_ROLE_UPDATE_UC,
			useClass: InitiateRoleUpdateUseCase,
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
		UserSyncProcessor,
	],
	exports: [],
})
export class UsersModule {}
