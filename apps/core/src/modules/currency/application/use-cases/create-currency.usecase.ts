import { isUniqueViolation } from '@common/errors/handlers/pg-errors';
import { err, ok, type Result } from '@common/interfaces/result.interface';
import type { Currency } from '@core/database/schema/currency.schema';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { type CreateCurrencyInput } from '@ferrite/schema/currency/create-currency.zodschema';
import { CurrencyAlreadyExistsError } from '@modules/currency/domain/errors/currency-already-exists.error';
import { ICreateCurrencyUseCase } from '@modules/currency/domain/ports/use-cases.port';
import { Inject, Injectable } from '@nestjs/common';
import {
	CURRENCY_REPOSITORY,
	type ICurrencyRepository,
} from '../../domain/ports/currency.repository.port';

@Injectable()
export class CreateCurrencyUseCase implements ICreateCurrencyUseCase {
	constructor(
		@Inject(CURRENCY_REPOSITORY)
		private readonly repo: ICurrencyRepository,

		@Inject(OTEL_TRACER) private readonly tracer: ITracer,

		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(
		input: CreateCurrencyInput
	): Promise<Result<Currency, CurrencyAlreadyExistsError | Error>> {
		return this.tracer.withSpan('CreateCurrencyUseCase.execute', async () => {
			try {
				const currency = await this.repo.create(input);

				this.logger.debug(
					`Created currency: code=${currency.code}, symbol=${currency.symbol}`
				);

				return ok(currency);
			} catch (e: unknown) {
				// Postgres unique-violation → domain error
				if (isUniqueViolation(e)) {
					this.logger.warn(`Currency already exists: code=${input.code}`);
					return err(new CurrencyAlreadyExistsError(input.code));
				}

				const error = e instanceof Error ? e : new Error(String(e));

				this.logger.error(
					`Failed to create currency: ${error.message}`,
					error.stack
				);

				return err(error);
			}
		});
	}
}
