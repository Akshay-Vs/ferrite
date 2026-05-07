import { err, ok, type Result } from '@common/interfaces/result.interface';
import type { Currency } from '@core/database/schema/currency.schema';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { IUpdateCurrencyUseCase } from '@modules/currency/domain/ports/use-cases.port';
import { UpdateCurrencyInput } from '@modules/currency/domain/schemas/update-currency.zodschema';
import { Inject, Injectable } from '@nestjs/common';
import { CurrencyNotFoundError } from '../../domain/errors/currency-not-found.error';
import {
	CURRENCY_REPOSITORY,
	type ICurrencyRepository,
} from '../../domain/ports/currency.repository.port';

@Injectable()
export class UpdateCurrencyUseCase implements IUpdateCurrencyUseCase {
	constructor(
		@Inject(CURRENCY_REPOSITORY)
		private readonly repo: ICurrencyRepository,

		@Inject(OTEL_TRACER) private readonly tracer: ITracer,

		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(
		payload: UpdateCurrencyInput
	): Promise<Result<Currency, CurrencyNotFoundError | Error>> {
		return this.tracer.withSpan('UpdateCurrencyUseCase.execute', async () => {
			try {
				const currency = await this.repo.update(payload.code, payload.data);

				if (!currency) {
					this.logger.warn(
						`Failed to update currency: Currency not found. code=${payload.code}`
					);
					return err(new CurrencyNotFoundError(payload.code));
				}

				this.logger.debug(`Updated currency: code=${payload.code}`);
				return ok(currency);
			} catch (e: any) {
				this.logger.error(
					`Unexpected persistence error during currency update: ${e.message}`,
					e.stack
				);
				return err(
					new Error(
						'Internal Server Error: An unexpected error occurred while updating the currency.'
					)
				);
			}
		});
	}
}
