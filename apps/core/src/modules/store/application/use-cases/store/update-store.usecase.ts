import { err, ok, type Result } from '@common/interfaces/result.interface';
import type { IUseCase } from '@common/interfaces/use-case.interface';
import type { Store } from '@core/database/schema/store.schema';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import type { UpdateStoreInput } from '@ferrite/schema/stores/update-store.zodschema';
import { Inject, Injectable } from '@nestjs/common';
import { StoreNotFoundError } from '../../../domain/errors/store-not-found.error';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '../../../domain/ports/store.repository.port';

export interface UpdateStorePayload {
	storeId: string;
	data: UpdateStoreInput;
}

export const UPDATE_STORE_UC = Symbol('UpdateStoreUseCase');

@Injectable()
export class UpdateStoreUseCase
	implements IUseCase<UpdateStorePayload, Store, StoreNotFoundError>
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
		payload: UpdateStorePayload
	): Promise<Result<Store, StoreNotFoundError>> {
		return this.tracer.withSpan('UpdateStoreUseCase.execute', async () => {
			const store = await this.repo.updateStore(
				undefined, // No tx needed
				payload.storeId,
				payload.data
			);

			if (!store) {
				this.logger.warn(
					`Failed to update store: Store not found. id=${payload.storeId}`
				);
				return err(new StoreNotFoundError(payload.storeId));
			}

			this.logger.debug(`Updated store: id=${payload.storeId}`);
			return ok(store);
		});
	}
}
