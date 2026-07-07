import { err, ok, type Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { type ListOwnStores } from '@ferrite/schema/stores/get-store.zodschema';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '@modules/store/domain/ports/store.repository.port';
import { Inject, Injectable } from '@nestjs/common';
import { type IGetStoresUseCase } from '../../../domain/ports/store-use-cases.port';

@Injectable()
export class GetStoresUseCase implements IGetStoresUseCase {
	constructor(
		@Inject(STORE_REPOSITORY)
		private readonly repo: IStoreRepository,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(input: {
		userId: string;
		cursor?: string;
		limit?: number;
	}): Promise<Result<ListOwnStores, Error>> {
		return this.tracer.withSpan('GetOwnStoresUseCase.execute', async () => {
			try {
				const result = await this.repo.findByUserId(
					input.userId,
					input.cursor,
					input.limit
				);
				this.logger.debug(
					`Fetched ${result.items.length} stores for user: userId=${input.userId}`
				);
				return ok(result);
			} catch (e) {
				const error = e instanceof Error ? e : new Error(String(e));
				this.logger.error(
					`Failed to fetch stores for user: userId=${input.userId}, error=${error.message}`,
					error.stack
				);
				return err(error);
			}
		});
	}
}
