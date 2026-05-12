import { err, ok, type Result } from '@common/interfaces/result.interface';
import type { IUseCase } from '@common/interfaces/use-case.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import type { GetStore } from '@ferrite/schema/stores/get-store.zodschema';
import { Inject, Injectable } from '@nestjs/common';
import { StoreNotFoundError } from '../../domain/errors/store-not-found.error';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '../../domain/ports/store.repository.port';

export const GET_PUBLIC_STORE_UC = Symbol('GetPublicStoreUseCase');
@Injectable()
export class GetPublicStoreUseCase
	implements IUseCase<string, GetStore, StoreNotFoundError>
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
	): Promise<Result<GetStore, StoreNotFoundError>> {
		return this.tracer.withSpan('GetPublicStoreUseCase.execute', async () => {
			try {
				const store = await this.repo.findById(storeId);

				if (!store || !store.isActive || store.deletedAt !== null) {
					this.logger.warn(`Public store not found: id=${storeId}`);
					return err(new StoreNotFoundError(storeId));
				}

				this.logger.debug(`Fetched public store: id=${storeId}`);
				return ok({
					id: store.id,
					name: store.name,
					currencyCode: store.currencyCode,
					slug: store.slug,
					isActive: store.isActive,
					bannerUrl: store.bannerUrl ?? undefined,
					storeIcon: store.icon ?? undefined,
					description: store.description ?? undefined,
				});
			} catch (e) {
				const error = e instanceof Error ? e : new Error(String(e));
				this.logger.error(
					`Failed to fetch public store: ${error.message}`,
					error.stack
				);
				return err(new StoreNotFoundError(storeId));
			}
		});
	}
}
