import { err, ok, type Result } from '@common/interfaces/result.interface';
import type { IUseCase } from '@common/interfaces/use-case.interface';
import { Store } from '@core/database/schema/store.schema';
import { Inject, Injectable } from '@nestjs/common';
import { StoreNotFoundError } from '../../domain/errors/store-not-found.error';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '../../domain/ports/store.repository.port';

export const GET_PUBLIC_STORE_UC = Symbol('GetPublicStoreUseCase');

export type PublicStoreDto = Pick<
	Store,
	'id' | 'name' | 'slug' | 'description' | 'bannerUrl' | 'iconUrl' | 'createdAt'
>;

@Injectable()
export class GetPublicStoreUseCase
	implements IUseCase<string, PublicStoreDto, StoreNotFoundError>
{
	constructor(
		@Inject(STORE_REPOSITORY)
		private readonly repo: IStoreRepository
	) {}

	async execute(
		storeId: string
	): Promise<Result<PublicStoreDto, StoreNotFoundError>> {
		const store = await this.repo.findById(storeId);

		if (!store || !store.isActive || store.deletedAt !== null) {
			return err(new StoreNotFoundError(storeId));
		}

		return ok({
			id: store.id,
			name: store.name,
			slug: store.slug,
			description: store.description,
			bannerUrl: store.bannerUrl,
			iconUrl: store.iconUrl,
			createdAt: store.createdAt,
		});
	}
}
