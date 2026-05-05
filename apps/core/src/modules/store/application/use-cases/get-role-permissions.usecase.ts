import { ok, type Result } from '@common/interfaces/result.interface';
import type { IUseCase } from '@common/interfaces/use-case.interface';
import type { PermissionKey } from '@common/schemas/permissions.zodschema';
import { Inject, Injectable } from '@nestjs/common';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '../../domain/ports/store.repository.port';

export interface GetRolePermissionsInput {
	storeId: string;
	roleId: string;
}

export const GET_ROLE_PERMISSIONS_UC = Symbol('GetRolePermissionsUseCase');

@Injectable()
export class GetRolePermissionsUseCase
	implements IUseCase<GetRolePermissionsInput, PermissionKey[], Error>
{
	constructor(
		@Inject(STORE_REPOSITORY)
		private readonly repo: IStoreRepository
	) {}

	async execute(
		input: GetRolePermissionsInput
	): Promise<Result<PermissionKey[], Error>> {
		const permissions = await this.repo.findRolePermissions(
			input.storeId,
			input.roleId
		);
		return ok(permissions);
	}
}
