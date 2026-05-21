import { isFkViolation } from '@common/errors/handlers/pg-errors';
import { err, ok, type Result } from '@common/interfaces/result.interface';
import type { StoreRole } from '@core/database/schema/store.schema';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { StoreNotFoundError } from '@modules/store/domain/errors/store-not-found.error';
import { Inject, Injectable } from '@nestjs/common';
import {
	type CreateStoreRoleInput,
	type ICreateStoreRoleUseCase,
} from '../../../domain/ports/role-use-cases.port';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '../../../domain/ports/store.repository.port';

@Injectable()
export class CreateStoreRoleUseCase implements ICreateStoreRoleUseCase {
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

				if (isFkViolation(e)) {
					throw new StoreNotFoundError(`Store ${input.storeId} not found`);
				}

				this.logger.error(
					`Failed to create store role: ${error.message}`,
					error.stack
				);
				return err(error);
			}
		});
	}
}
