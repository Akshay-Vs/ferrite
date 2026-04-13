import { ok, type Result } from '@common/interfaces/result.interface';
import type { IUseCase } from '@common/interfaces/use-case.interface';
import type { PermissionKey } from '@common/schemas/permissions.zodschema';
import type { StoreRole } from '@core/database/schema/store.schema';
import { Inject, Injectable } from '@nestjs/common';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '../../domain/ports/store.repository.port';

export interface CreateStoreRoleInput {
	tx: unknown;
	storeId: string;
	name: string;
	description: string | null;
	isSystem: boolean;
	permissions: PermissionKey[];
}

export const CREATE_STORE_ROLE_UC = Symbol('CreateStoreRoleUseCase');

@Injectable()
export class CreateStoreRoleUseCase
	implements IUseCase<CreateStoreRoleInput, StoreRole, Error>
{
	constructor(
		@Inject(STORE_REPOSITORY)
		private readonly repo: IStoreRepository
	) {}

	async execute(
		input: CreateStoreRoleInput
	): Promise<Result<StoreRole, Error>> {
		const role = await this.repo.createStoreRole(
			input.tx,
			input.storeId,
			input.name,
			input.description,
			input.isSystem,
			input.permissions
		);
		return ok(role);
	}
}
