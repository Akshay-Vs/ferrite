import { ok, type Result } from '@common/interfaces/result.interface';
import type { IUseCase } from '@common/interfaces/use-case.interface';
import type { Store } from '@core/database/schema/store.schema';
import { Inject, Injectable } from '@nestjs/common';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '../../domain/ports/store.repository.port';

export const GET_OWN_STORES_UC = Symbol('GetOwnStoresUseCase');

@Injectable()
export class GetOwnStoresUseCase implements IUseCase<string, Store[], Error> {
	constructor(
		@Inject(STORE_REPOSITORY)
		private readonly repo: IStoreRepository
	) {}

	async execute(userId: string): Promise<Result<Store[], Error>> {
		const stores = await this.repo.findByUserId(userId);
		return ok(stores);
	}
}
