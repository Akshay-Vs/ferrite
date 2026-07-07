import { ok, type Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer, OTEL_TRACER } from '@core/tracer';
import {
	type StoreConfig,
	type UpdateStoreConfigInput,
} from '@ferrite/schema/stores/store-config.zodschema';
import { Inject, Injectable } from '@nestjs/common';
import {
	type IStoreConfigRepository,
	STORE_CONFIG_REPOSITORY,
} from '../../../domain/ports/store-config.repository.port';
import { type IUpdateStoreConfigUC } from '../../../domain/ports/store-config-usecase.port';

@Injectable()
export class UpdateStoreConfigUseCase implements IUpdateStoreConfigUC {
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
		config: UpdateStoreConfigInput;
	}): Promise<Result<StoreConfig, Error>> {
		return this.tracer.withSpan('use-case.update-store-config', async () => {
			const updated = await this.configRepo.upsertConfig(
				input.storeId,
				input.config
			);
			return ok(updated);
		});
	}
}
