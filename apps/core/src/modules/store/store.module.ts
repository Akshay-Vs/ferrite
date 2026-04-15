import { Module } from '@nestjs/common';
import { AddStoreMemberUseCase } from './application/use-cases/add-store-member.usecase';
import { CheckStorePermissionUseCase } from './application/use-cases/check-store-permission.usecase';
// Use Cases
import { CreateStoreUseCase } from './application/use-cases/create-store.usecase';
import { CreateStoreRoleUseCase } from './application/use-cases/create-store-role.usecase';
import { DeleteStoreUseCase } from './application/use-cases/delete-store.usecase';
import { GetOwnStoresUseCase } from './application/use-cases/get-own-stores.usecase';
import { GetPublicStoreUseCase } from './application/use-cases/get-public-store.usecase';
import { InitializeStoreOrchestratorUseCase } from './application/use-cases/initialize-store-orchestrator.usecase';
import { UpdateStoreUseCase } from './application/use-cases/update-store.usecase';
import { STORE_REPOSITORY } from './domain/ports/store.repository.port';
import { STORE_PERMISSION_CHECKER } from './domain/ports/store-permission-checker.port';
import { StoreController } from './infrastructure/http/controllers/store.controller';
import { StorePermissionGuard } from './infrastructure/http/guards/store-permission.guard';
import { DrizzleStoreRepository } from './infrastructure/persistance/repositories/drizzle-store.repository';
import { DrizzleStorePermissionRepository } from './infrastructure/persistance/repositories/drizzle-store-permission.repository';

@Module({
	controllers: [StoreController],
	providers: [
		{
			provide: STORE_REPOSITORY,
			useClass: DrizzleStoreRepository,
		},
		{
			provide: STORE_PERMISSION_CHECKER,
			useClass: DrizzleStorePermissionRepository,
		},
		CheckStorePermissionUseCase,
		StorePermissionGuard,
		CreateStoreUseCase,
		CreateStoreRoleUseCase,
		AddStoreMemberUseCase,
		InitializeStoreOrchestratorUseCase,
		GetOwnStoresUseCase,
		GetPublicStoreUseCase,
		UpdateStoreUseCase,
		DeleteStoreUseCase,
	],
	exports: [
		STORE_REPOSITORY,
		STORE_PERMISSION_CHECKER,
		CheckStorePermissionUseCase,
		StorePermissionGuard,
	],
})
export class StoreModule {}
