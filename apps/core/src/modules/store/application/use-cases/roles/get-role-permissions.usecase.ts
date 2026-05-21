import { err, ok, type Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import type { PermissionKey } from '@ferrite/schema/common/permissions.zodschema';
import { Inject, Injectable } from '@nestjs/common';
import {
	type GetRolePermissionsInput,
	type IGetRolePermissionsUseCase,
} from '../../../domain/ports/role-use-cases.port';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '../../../domain/ports/store.repository.port';

@Injectable()
export class GetRolePermissionsUseCase implements IGetRolePermissionsUseCase {
	constructor(
		@Inject(STORE_REPOSITORY)
		private readonly repo: IStoreRepository,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(
		input: GetRolePermissionsInput
	): Promise<Result<PermissionKey[], Error>> {
		return this.tracer.withSpan(
			'GetRolePermissionsUseCase.execute',
			async () => {
				try {
					const permissions = await this.repo.findRolePermissions(
						input.storeId,
						input.roleId
					);
					this.logger.debug(
						`Fetched ${permissions.length} permissions for role: roleId=${input.roleId}, storeId=${input.storeId}`
					);
					return ok(permissions);
				} catch (e) {
					const error = e instanceof Error ? e : new Error(String(e));
					this.logger.error(
						`Failed to fetch role permissions: ${error.message}`,
						error.stack
					);
					return err(error);
				}
			}
		);
	}
}
