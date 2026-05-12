import { PublicRoute } from '@common/decorators/public-route.decorator';
import { RequireRole } from '@common/decorators/require-role.decorator';
import type { Currency } from '@core/database/schema/currency.schema';
import { type ITracer, OTEL_TRACER } from '@core/tracer';
import { PlatformRoles } from '@ferrite/schema/common/platform-roles.zodschema';

import { CreateCurrencyUseCase } from '@modules/currency/application/use-cases/create-currency.usecase';
import { DeleteCurrencyUseCase } from '@modules/currency/application/use-cases/delete-currency.usecase';
import { GetCurrenciesUseCase } from '@modules/currency/application/use-cases/get-currencies.usecase';
import { UpdateCurrencyUseCase } from '@modules/currency/application/use-cases/update-currency.usecase';
import { CurrencyAlreadyExistsError } from '@modules/currency/domain/errors/currency-already-exists.error';
import { CurrencyInUseError } from '@modules/currency/domain/errors/currency-in-use.error';
import { CurrencyNotFoundError } from '@modules/currency/domain/errors/currency-not-found.error';
import {
	Body,
	ConflictException,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Inject,
	InternalServerErrorException,
	NotFoundException,
	Param,
	Patch,
	Post,
	Query,
	UnprocessableEntityException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateCurrencyDto, UpdateCurrencyDto } from '../dto/currency.dto';
import {
	CreateCurrencyDocs,
	DeleteCurrencyDocs,
	GetCurrenciesDocs,
	GetCurrencyByCodeDocs,
	UpdateCurrencyDocs,
} from './docs/currency.swaggerdocs';

@ApiTags('Currencies')
@ApiBearerAuth('swagger-access-token')
@Controller('currencies')
export class CurrencyController {
	constructor(
		private readonly createCurrencyUc: CreateCurrencyUseCase,
		private readonly getCurrenciesUc: GetCurrenciesUseCase,
		private readonly updateCurrencyUc: UpdateCurrencyUseCase,
		private readonly deleteCurrencyUc: DeleteCurrencyUseCase,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer
	) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@CreateCurrencyDocs()
	@RequireRole(PlatformRoles.STAFF)
	async createCurrency(@Body() payload: CreateCurrencyDto): Promise<Currency> {
		return this.tracer.withSpan('http.create-currency', async () => {
			const result = await this.createCurrencyUc.execute(payload);

			if (result.isErr()) {
				if (result.error instanceof CurrencyAlreadyExistsError) {
					throw new ConflictException(result.error.message);
				}

				throw new UnprocessableEntityException('Failed to create currency');
			}

			return result.value;
		});
	}

	@Get()
	@GetCurrenciesDocs()
	@PublicRoute()
	async getCurrencies(
		@Query('activeOnly') activeOnly?: string
	): Promise<Currency[]> {
		return this.tracer.withSpan('http.get-currencies', async () => {
			const result = await this.getCurrenciesUc.execute({
				activeOnly: activeOnly === 'true',
			});

			if (result.isErr()) {
				throw new InternalServerErrorException('Failed to get currency');
			}

			return result.value;
		});
	}

	@Get(':code')
	@GetCurrencyByCodeDocs()
	@PublicRoute()
	async getCurrencyByCode(@Param('code') code: string): Promise<Currency> {
		return this.tracer.withSpan('http.get-currency-by-code', async () => {
			const result = await this.getCurrenciesUc.execute({
				code,
			});

			if (result.isErr()) {
				if (result.error instanceof CurrencyNotFoundError) {
					throw new NotFoundException(result.error.message);
				}

				throw new InternalServerErrorException('Failed to get currency');
			}

			const currency = result.value.find((c) => c.code === code.toUpperCase());

			if (!currency) {
				throw new NotFoundException(`Currency ${code} not found`);
			}

			return currency;
		});
	}

	@Patch(':code')
	@UpdateCurrencyDocs()
	@RequireRole(PlatformRoles.STAFF)
	async updateCurrency(
		@Param('code') code: string,
		@Body() payload: UpdateCurrencyDto
	): Promise<Currency> {
		return this.tracer.withSpan('http.update-currency', async () => {
			const result = await this.updateCurrencyUc.execute({
				code: code.toUpperCase(),
				data: payload,
			});

			if (result.isErr()) {
				if (result.error instanceof CurrencyNotFoundError) {
					throw new NotFoundException(result.error.message);
				}
				throw new UnprocessableEntityException('Failed to update currency');
			}

			return result.value;
		});
	}

	@Delete(':code')
	@HttpCode(HttpStatus.NO_CONTENT)
	@DeleteCurrencyDocs()
	@RequireRole(PlatformRoles.STAFF)
	async deleteCurrency(@Param('code') code: string): Promise<void> {
		return this.tracer.withSpan('http.delete-currency', async () => {
			const result = await this.deleteCurrencyUc.execute(code.toUpperCase());

			if (result.isErr()) {
				if (result.error instanceof CurrencyNotFoundError) {
					throw new NotFoundException(result.error.message);
				}
				if (result.error instanceof CurrencyInUseError) {
					throw new ConflictException(result.error.message);
				}
				throw new UnprocessableEntityException('Failed to delete currency');
			}
		});
	}
}
