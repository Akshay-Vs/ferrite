import { err, ok, type Result } from '@common/interfaces/result.interface';
import type { IUseCase } from '@common/interfaces/use-case.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import type { PermissionKey } from '@ferrite/schema/common/permissions.zodschema';
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
		private readonly permissionChecker: IStorePermissionChecker,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(
		input: CheckStorePermissionInput
	): Promise<Result<boolean, MemberNotFoundError>> {
		return this.tracer.withSpan(
			'CheckStorePermissionUseCase.execute',
			async () => {
				const { userId, storeId, requiredPermissions } = input;

				const grantedPermissions = await this.permissionChecker.getPermissions(
					userId,
					storeId
				);

				// null signals the user is not a member of the store
				if (grantedPermissions === null) {
					this.logger.warn(
						`Permission check failed: User is not a member of the store. userId=${userId}, storeId=${storeId}`
					);
					return err(new MemberNotFoundError(userId, storeId));
				}

				const grantedSet = new Set(grantedPermissions);

				const hasAll = requiredPermissions.every((perm) =>
					grantedSet.has(perm)
				);

				if (!hasAll) {
					this.logger.debug(
						`Permission check: User lacks required permissions. userId=${userId}, storeId=${storeId}, required=${requiredPermissions}`
					);
				}

				return ok(hasAll);
			}
		);
	}
}
