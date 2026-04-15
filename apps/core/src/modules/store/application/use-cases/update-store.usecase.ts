import { err, ok, type Result } from '@common/interfaces/result.interface';
import type { IUseCase } from '@common/interfaces/use-case.interface';
import type { Store } from '@core/database/schema/store.schema';
import { Inject, Injectable } from '@nestjs/common';
import { StoreNotFoundError } from '../../domain/errors/store-not-found.error';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '../../domain/ports/store.repository.port';
import type { UpdateStoreInput } from '../../domain/schemas/update-store.zodschema';

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
		private readonly repo: IStoreRepository
	) {}

	async execute(
		payload: UpdateStorePayload
	): Promise<Result<Store, StoreNotFoundError>> {
		const store = await this.repo.updateStore(
			null, // No tx needed
			payload.storeId,
			payload.data
		);

		if (!store) {
			return err(new StoreNotFoundError(payload.storeId));
		}

		return ok(store);
	}
}
