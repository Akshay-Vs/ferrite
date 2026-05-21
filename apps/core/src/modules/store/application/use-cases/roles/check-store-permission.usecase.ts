import { err, ok, type Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { Inject, Injectable } from '@nestjs/common';
import { MemberNotFoundError } from '../../../domain/errors/member-not-found.error';
import {
	type CheckStorePermissionInput,
	type ICheckStorePermissionUseCase,
} from '../../../domain/ports/role-use-cases.port';
import {
	type IStorePermissionChecker,
	STORE_PERMISSION_CHECKER,
} from '../../../domain/ports/store-permission-checker.port';

@Injectable()
export class CheckStorePermissionUseCase
	implements ICheckStorePermissionUseCase
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
