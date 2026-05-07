import { err, ok, type Result } from '@common/interfaces/result.interface';
import type { IUseCase } from '@common/interfaces/use-case.interface';
import { Store } from '@core/database/schema/store.schema';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { Inject, Injectable } from '@nestjs/common';
import { StoreNotFoundError } from '../../domain/errors/store-not-found.error';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '../../domain/ports/store.repository.port';

export const GET_PUBLIC_STORE_UC = Symbol('GetPublicStoreUseCase');

export type PublicStoreDto = Pick<
	Store,
	'id' | 'name' | 'description' | 'bannerUrl' | 'icon' | 'createdAt'
>;

@Injectable()
export class GetPublicStoreUseCase
	implements IUseCase<string, PublicStoreDto, StoreNotFoundError>
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
		storeId: string
	): Promise<Result<PublicStoreDto, StoreNotFoundError>> {
		return this.tracer.withSpan('GetPublicStoreUseCase.execute', async () => {
			const store = await this.repo.findById(storeId);

			if (!store || !store.isActive || store.deletedAt !== null) {
				this.logger.warn(`Public store not found: id=${storeId}`);
				return err(new StoreNotFoundError(storeId));
			}

			this.logger.debug(`Fetched public store: id=${storeId}`);
			return ok({
				id: store.id,
				name: store.name,
				description: store.description,
				bannerUrl: store.bannerUrl,
				icon: store.icon,
				createdAt: store.createdAt,
			});
		});
	}
}
