import { err, ok, type Result } from '@common/interfaces/result.interface';
import type { ITransactionContext } from '@common/interfaces/unit-of-work.interface';
import type { IUseCase } from '@common/interfaces/use-case.interface';
import type { PermissionKey } from '@common/schemas/permissions.zodschema';
import type { StoreRole } from '@core/database/schema/store.schema';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { Inject, Injectable } from '@nestjs/common';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '../../domain/ports/store.repository.port';

export interface CreateStoreRoleInput {
	tx?: ITransactionContext;
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
		private readonly repo: IStoreRepository,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(
		input: CreateStoreRoleInput
	): Promise<Result<StoreRole, Error>> {
		return this.tracer.withSpan('CreateStoreRoleUseCase.execute', async () => {
			try {
				const role = await this.repo.createStoreRole(
					input.tx,
					input.storeId,
					input.name,
					input.description,
					input.isSystem,
					input.permissions
				);
				this.logger.debug(
					`Created store role: storeId=${input.storeId}, name=${input.name}`
				);
				return ok(role);
			} catch (e) {
				const error = e instanceof Error ? e : new Error(String(e));
				this.logger.error(
					`Failed to create store role: ${error.message}`,
					error.stack
				);
				return err(error);
			}
		});
	}
}
