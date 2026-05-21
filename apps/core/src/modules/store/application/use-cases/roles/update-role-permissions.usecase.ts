import { err, ok, type Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { Inject, Injectable } from '@nestjs/common';
import { RoleNotFoundError } from '../../../domain/errors/role-not-found.error';
import { SystemRoleProtectedError } from '../../../domain/errors/system-role-protected.error';
import {
	type IUpdateRolePermissionsUseCase,
	type UpdateRolePermissionsError,
	type UpdateRolePermissionsInput,
} from '../../../domain/ports/role-use-cases.port';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '../../../domain/ports/store.repository.port';
import {
	type IStorePermissionChecker,
	STORE_PERMISSION_CHECKER,
} from '../../../domain/ports/store-permission-checker.port';

@Injectable()
export class UpdateRolePermissionsUseCase
	implements IUpdateRolePermissionsUseCase
{
	constructor(
		@Inject(STORE_REPOSITORY)
		private readonly repo: IStoreRepository,
		@Inject(STORE_PERMISSION_CHECKER)
		private readonly permissionChecker: IStorePermissionChecker,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(
		input: UpdateRolePermissionsInput
	): Promise<Result<void, UpdateRolePermissionsError>> {
		return this.tracer.withSpan(
			'UpdateRolePermissionsUseCase.execute',
			async () => {
				try {
					const role = await this.repo.findRoleById(
						input.storeId,
						input.roleId
					);
					if (!role) {
						return err(new RoleNotFoundError(input.roleId, input.storeId));
					}

					if (role.isSystem) {
						return err(new SystemRoleProtectedError(input.roleId));
					}

					const updated = await this.repo.updateRolePermissions(
						input.tx,
						input.storeId,
						input.roleId,
						input.permissions
					);

					if (!updated) {
						return err(new RoleNotFoundError(input.roleId, input.storeId));
					}

					this.logger.debug(
						`Updated role permissions: storeId=${input.storeId}, roleId=${input.roleId}`
					);

					try {
						await this.permissionChecker.invalidatePermissionsByRole(
							input.storeId,
							input.roleId
						);
					} catch (cacheErr) {
						this.logger.warn(
							`Cache invalidation failed for role ${input.roleId} in store ${input.storeId}`,
							String(cacheErr)
						);
					}

					return ok();
				} catch (e) {
					const error = e instanceof Error ? e : new Error(String(e));
					this.logger.error(
						`Failed to update role permissions: ${error.message}`,
						error.stack
					);
					return err(error);
				}
			}
		);
	}
}
