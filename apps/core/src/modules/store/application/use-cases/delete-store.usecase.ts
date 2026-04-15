import { err, ok, type Result } from '@common/interfaces/result.interface';
import type { IUseCase } from '@common/interfaces/use-case.interface';
import { Inject, Injectable } from '@nestjs/common';
import { StoreNotFoundError } from '../../domain/errors/store-not-found.error';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '../../domain/ports/store.repository.port';

export const DELETE_STORE_UC = Symbol('DeleteStoreUseCase');

@Injectable()
export class DeleteStoreUseCase
	implements IUseCase<string, void, StoreNotFoundError>
{
	constructor(
		@Inject(STORE_REPOSITORY)
		private readonly repo: IStoreRepository
	) {}

	async execute(storeId: string): Promise<Result<void, StoreNotFoundError>> {
		const success = await this.repo.softDeleteStore(null, storeId);

		if (!success) {
			return err(new StoreNotFoundError(storeId));
		}

		return ok();
	}
}
