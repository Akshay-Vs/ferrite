import { ok, type Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer, OTEL_TRACER } from '@core/tracer';
import { type StoreConfig } from '@ferrite/schema/stores/store-config.zodschema';
import { Inject, Injectable } from '@nestjs/common';
import {
	type IStoreConfigRepository,
	STORE_CONFIG_REPOSITORY,
} from '../../../domain/ports/store-config.repository.port';
import { type IGetStoreConfigUC } from '../../../domain/ports/store-config-usecase.port';

@Injectable()
export class GetStoreConfigUseCase implements IGetStoreConfigUC {
	constructor(
		private readonly logger: AppLogger,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		@Inject(STORE_CONFIG_REPOSITORY)
		private readonly configRepo: IStoreConfigRepository
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(input: {
		storeId: string;
	}): Promise<Result<StoreConfig, Error>> {
		return this.tracer.withSpan('use-case.get-store-config', async () => {
			let config = await this.configRepo.getConfig(input.storeId);
			if (!config) {
				// Return default config if none exists
				config = {
					storeId: input.storeId,
					frontendUrl: null,
					htmlTemplate: null,
					updatedAt: new Date(),
				};
			}
			return ok(config);
		});
	}
}
