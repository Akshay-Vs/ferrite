import { err, ok, type Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { Inject, Injectable } from '@nestjs/common';
import { StoreNotFoundError } from '../../../domain/errors/store-not-found.error';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '../../../domain/ports/store.repository.port';
import { type IDeleteStoreUseCase } from '../../../domain/ports/store-use-cases.port';

@Injectable()
export class DeleteStoreUseCase implements IDeleteStoreUseCase {
	constructor(
		@Inject(STORE_REPOSITORY)
		private readonly repo: IStoreRepository,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(storeId: string): Promise<Result<void, StoreNotFoundError>> {
		return this.tracer.withSpan('DeleteStoreUseCase.execute', async () => {
			const success = await this.repo.softDeleteStore(undefined, storeId);

			if (!success) {
				this.logger.warn(
					`Failed to delete store: Store not found. id=${storeId}`
				);
				return err(new StoreNotFoundError(storeId));
			}

			this.logger.debug(`Soft-deleted store: id=${storeId}`);
			return ok();
		});
	}
}
