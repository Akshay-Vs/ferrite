import { ok, type Result } from '@common/interfaces/result.interface';
import type { Currency } from '@core/database/schema/currency.schema';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { IGetCurrenciesUseCase } from '@modules/currency/domain/ports/use-cases.port';
import { GetCurrenciesInput } from '@modules/currency/domain/schemas/get-currencies.zodschema';
import { Inject, Injectable } from '@nestjs/common';
import {
	CURRENCY_REPOSITORY,
	type ICurrencyRepository,
} from '../../domain/ports/currency.repository.port';

@Injectable()
export class GetCurrenciesUseCase implements IGetCurrenciesUseCase {
	constructor(
		@Inject(CURRENCY_REPOSITORY)
		private readonly repo: ICurrencyRepository,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(input: GetCurrenciesInput): Promise<Result<Currency[], Error>> {
		return this.tracer.withSpan('GetCurrenciesUseCase.execute', async () => {
			const currencies = await this.repo.findAll(input.activeOnly);
			this.logger.debug(
				`Fetched ${currencies.length} currencies (activeOnly=${input.activeOnly ?? false})`
			);
			return ok(currencies);
		});
	}
}
