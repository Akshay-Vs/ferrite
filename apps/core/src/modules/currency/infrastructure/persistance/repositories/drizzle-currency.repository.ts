import { DB } from '@core/database/db.provider';
import type { TDatabase } from '@core/database/db.type';
import { currencies } from '@core/database/schema';
import type { Currency } from '@core/database/schema/currency.schema';
import { traceDbOp } from '@core/database/utils/trace-db-op.util';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { UpdateCurrencyPayload } from '@modules/currency/domain/schemas/update-currency.zodschema';
import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { ICurrencyRepository } from '../../../domain/ports/currency.repository.port';
import type { CreateCurrencyInput } from '../../../domain/schemas/create-currency.zodschema';

@Injectable()
export class DrizzleCurrencyRepository implements ICurrencyRepository {
	constructor(
		@Inject(DB) private readonly db: TDatabase,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		@Inject(AppLogger) private readonly appLogger: AppLogger
	) {
		this.appLogger.setContext(this.constructor.name);
	}

	async create(input: CreateCurrencyInput): Promise<Currency> {
		return traceDbOp(
			this.tracer,
			'db.currencies.create',
			{ 'db.table': 'currencies', 'db.operation': 'insert' },
			async () => {
				const [currency] = await this.db
					.insert(currencies)
					.values({
						code: input.code,
						symbol: input.symbol,
						decimalPrecision: input.decimalPrecision,
						isActive: input.isActive,
					})
					.returning();
				if (!currency) throw new Error('Failed to create currency');
				return currency;
			}
		);
	}

	async findByCode(code: string): Promise<Currency | null> {
		return traceDbOp(
			this.tracer,
			'db.currencies.findByCode',
			{ 'db.table': 'currencies', 'db.operation': 'select' },
			async () => {
				const [currency] = await this.db
					.select()
					.from(currencies)
					.where(eq(currencies.code, code));
				return currency || null;
			}
		);
	}

	async findAll(activeOnly?: boolean): Promise<Currency[]> {
		return traceDbOp(
			this.tracer,
			'db.currencies.findAll',
			{ 'db.table': 'currencies', 'db.operation': 'select' },
			async () => {
				const query = this.db.select().from(currencies);

				if (activeOnly) {
					return query.where(eq(currencies.isActive, true));
				}

				return query;
			}
		);
	}

	async update(
		code: string,
		data: UpdateCurrencyPayload
	): Promise<Currency | null> {
		return traceDbOp(
			this.tracer,
			'db.currencies.update',
			{ 'db.table': 'currencies', 'db.operation': 'update' },
			async () => {
				const [currency] = await this.db
					.update(currencies)
					.set(data)
					.where(eq(currencies.code, code))
					.returning();
				return currency || null;
			}
		);
	}

	async delete(code: string): Promise<boolean> {
		return traceDbOp(
			this.tracer,
			'db.currencies.delete',
			{ 'db.table': 'currencies', 'db.operation': 'delete' },
			async () => {
				const [deleted] = await this.db
					.delete(currencies)
					.where(eq(currencies.code, code))
					.returning({ code: currencies.code });
				return !!deleted;
			}
		);
	}
}
