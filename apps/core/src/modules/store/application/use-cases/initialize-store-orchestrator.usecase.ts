import { ok, type Result } from '@common/interfaces/result.interface';
import type { IUseCase } from '@common/interfaces/use-case.interface';
import { STORE_PERMISSIONS } from '@common/schemas/permissions.zodschema';
import type { Store } from '@core/database/schema/store.schema';
import {
	type IStorePermissionChecker,
	STORE_PERMISSION_CHECKER,
} from '@modules/auth/domain/ports/store-permission-checker.port';
import { Inject, Injectable } from '@nestjs/common';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '../../domain/ports/store.repository.port';
import type { CreateStoreInput } from '../../domain/schemas/create-store.zodschema';
import { AddStoreMemberUseCase } from './add-store-member.usecase';
import { CreateStoreUseCase } from './create-store.usecase';
import { CreateStoreRoleUseCase } from './create-store-role.usecase';

export interface InitializeStoreInput {
	input: CreateStoreInput;
	createdBy: string;
}

export const INITIALIZE_STORE_ORCHESTRATOR_UC = Symbol(
	'InitializeStoreOrchestratorUseCase'
);

@Injectable()
export class InitializeStoreOrchestratorUseCase
	implements IUseCase<InitializeStoreInput, Store, Error>
{
	constructor(
		@Inject(STORE_REPOSITORY)
		private readonly repo: IStoreRepository,
		@Inject(STORE_PERMISSION_CHECKER)
		private readonly permissionChecker: IStorePermissionChecker,
		private readonly createStoreUc: CreateStoreUseCase,
		private readonly createStoreRoleUc: CreateStoreRoleUseCase,
		private readonly addStoreMemberUc: AddStoreMemberUseCase
	) {}

	async execute(payload: InitializeStoreInput): Promise<Result<Store, Error>> {
		const result = await this.repo.transaction(async (tx) => {
			// 1. Create the store
			const storeRes = await this.createStoreUc.execute({
				tx,
				input: payload.input,
				createdBy: payload.createdBy,
			});
			if (storeRes.isErr()) throw storeRes.error;

			// 2. Create the owner role with all permissions
			const roleRes = await this.createStoreRoleUc.execute({
				tx,
				storeId: storeRes.value.id,
				name: 'Owner',
				description: 'Default store owner role',
				isSystem: true,
				permissions: [...STORE_PERMISSIONS],
			});
			if (roleRes.isErr()) throw roleRes.error;

			// 3. Add the creator as an owner member
			const memberRes = await this.addStoreMemberUc.execute({
				tx,
				storeId: storeRes.value.id,
				userId: payload.createdBy,
				roleId: roleRes.value.id,
				isOwner: true,
			});
			if (memberRes.isErr()) throw memberRes.error;

			return ok(storeRes.value);
		});

		// 4. Invalidate permission cache after commit
		if (result.isOk()) {
			await this.permissionChecker.invalidatePermissions(
				payload.createdBy,
				result.value.id
			);
		}

		return result;
	}
}
