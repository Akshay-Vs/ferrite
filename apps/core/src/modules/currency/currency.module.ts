import { Module } from '@nestjs/common';
import { CreateCurrencyUseCase } from './application/use-cases/create-currency.usecase';
import { DeleteCurrencyUseCase } from './application/use-cases/delete-currency.usecase';
import { GetCurrenciesUseCase } from './application/use-cases/get-currencies.usecase';
import { UpdateCurrencyUseCase } from './application/use-cases/update-currency.usecase';
import { CURRENCY_REPOSITORY } from './domain/ports/currency.repository.port';
import { CurrencyController } from './infrastructure/http/controllers/currency.controller';
import { DrizzleCurrencyRepository } from './infrastructure/persistance/repositories/drizzle-currency.repository';

@Module({
	controllers: [CurrencyController],
	providers: [
		// Repository
		{
			provide: CURRENCY_REPOSITORY,
			useClass: DrizzleCurrencyRepository,
		},

		// Use cases
		CreateCurrencyUseCase,
		GetCurrenciesUseCase,
		UpdateCurrencyUseCase,
		DeleteCurrencyUseCase,
	],
	exports: [CURRENCY_REPOSITORY, GetCurrenciesUseCase],
})
export class CurrencyModule {}
