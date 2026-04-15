import { err, ok, type Result } from '@common/interfaces/result.interface';
import type { IUseCase } from '@common/interfaces/use-case.interface';
import type { PermissionKey } from '@common/schemas/permissions.zodschema';
import { Inject, Injectable } from '@nestjs/common';
import { MemberNotFoundError } from '../../domain/errors/member-not-found.error';
import {
	type IStorePermissionChecker,
	STORE_PERMISSION_CHECKER,
} from '../../domain/ports/store-permission-checker.port';

export interface CheckStorePermissionInput {
	userId: string;
	storeId: string;
	requiredPermissions: PermissionKey[];
}

export const CHECK_STORE_PERMISSION_UC = Symbol('CheckStorePermissionUseCase');

@Injectable()
export class CheckStorePermissionUseCase
	implements IUseCase<CheckStorePermissionInput, boolean, MemberNotFoundError>
{
	constructor(
		@Inject(STORE_PERMISSION_CHECKER)
		private readonly permissionChecker: IStorePermissionChecker
	) {}

	async execute(
		input: CheckStorePermissionInput
	): Promise<Result<boolean, MemberNotFoundError>> {
		const { userId, storeId, requiredPermissions } = input;

		const grantedPermissions = await this.permissionChecker.getPermissions(
			userId,
			storeId
		);

		// null signals the user is not a member of the store
		if (grantedPermissions === null) {
			return err(new MemberNotFoundError(userId, storeId));
		}

		const grantedSet = new Set(grantedPermissions);

		const hasAll = requiredPermissions.every((perm) => grantedSet.has(perm));

		return ok(hasAll);
	}
}
