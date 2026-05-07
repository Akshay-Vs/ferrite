import { isFkViolation } from '@common/errors/handlers/pg-errors';
import { err, ok, type Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { CurrencyInUseError } from '@modules/currency/domain/errors/currency-in-use.error';
import { IDeleteCurrencyUseCase } from '@modules/currency/domain/ports/use-cases.port';
import { Inject, Injectable } from '@nestjs/common';
import { CurrencyNotFoundError } from '../../domain/errors/currency-not-found.error';
import {
	CURRENCY_REPOSITORY,
	type ICurrencyRepository,
} from '../../domain/ports/currency.repository.port';

@Injectable()
export class DeleteCurrencyUseCase implements IDeleteCurrencyUseCase {
	constructor(
		@Inject(CURRENCY_REPOSITORY)
		private readonly repo: ICurrencyRepository,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(
		code: string
	): Promise<Result<void, CurrencyNotFoundError | CurrencyInUseError | Error>> {
		return this.tracer.withSpan('DeleteCurrencyUseCase.execute', async () => {
			try {
				const success = await this.repo.delete(code);

				if (!success) {
					this.logger.warn(
						`Failed to delete currency: Currency not found. code=${code}`
					);
					return err(new CurrencyNotFoundError(code));
				}

				this.logger.debug(`Deleted currency: code=${code}`);
				return ok();
			} catch (e: any) {
				// Postgres unique-violation → domain error
				if (isFkViolation(e)) {
					this.logger.error(
						`Failed to delete currency: Referential integrity violation. code=${code}`
					);
					return err(new CurrencyInUseError(code));
				}

				this.logger.error(
					`Unexpected persistence error during currency deletion: ${e.message}`,
					e.stack
				);
				return err(
					new Error('An unexpected error occurred while deleting the currency.')
				);
			}
		});
	}
}
