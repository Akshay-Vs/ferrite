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
				// Handle Foreign Key Constraint Violations (PostgreSQL code 23503).
				// Drizzle wraps the original pg DatabaseError inside DrizzleQueryError.cause,
				// so e.code is undefined — we must inspect e.cause for the pg error code/message/detail.
				const cause = e.cause as any;
				const errorCode = e.code ?? cause?.code;
				// Drizzle's wrapper message is "Failed query: …" — check the underlying cause messages too.
				const errorMessage = [e.message, cause?.message]
					.join(' ')
					.toLowerCase();
				const errorDetail = [e.detail, cause?.detail]
					.filter(Boolean)
					.join(' ')
					.toLowerCase();

				if (
					errorCode === '23503' ||
					errorMessage.includes('foreign key constraint') ||
					errorDetail.includes('is still referenced') ||
					errorDetail.includes('foreign key constraint')
				) {
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
					new Error(
						'Internal Server Error: An unexpected error occurred while deleting the currency.'
					)
				);
			}
		});
	}
}
