import { DB } from '@core/database/db.provider';
import type { TDatabase } from '@core/database/db.type';
import { storePreferences } from '@core/database/schema/preferences.schema';
import { traceDbOp } from '@core/database/utils/trace-db-op.util';
import type { ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { type StoreConfig } from '@ferrite/schema/stores/store-config.zodschema';
import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { IStoreConfigRepository } from '../../../domain/ports/store-config.repository.port';
import { StoreConfigMapper } from '../mappers/store-config.mapper';

@Injectable()
export class DrizzleStoreConfigRepository implements IStoreConfigRepository {
	constructor(
		@Inject(DB) private readonly db: TDatabase,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer
	) {}

	async getConfig(storeId: string): Promise<StoreConfig | null> {
		return traceDbOp(
			this.tracer,
			'db.storePreferences.getConfig',
			{ 'db.table': 'store_preferences', 'db.operation': 'select' },
			async () => {
				const [row] = await this.db
					.select()
					.from(storePreferences)
					.where(eq(storePreferences.storeId, storeId))
					.limit(1);

				if (!row) {
					return null;
				}

				return StoreConfigMapper.toDomain(row);
			}
		);
	}

	async upsertConfig(
		storeId: string,
		config: Partial<Omit<StoreConfig, 'storeId' | 'updatedAt'>>
	): Promise<StoreConfig> {
		return traceDbOp(
			this.tracer,
			'db.storePreferences.upsertConfig',
			{ 'db.table': 'store_preferences', 'db.operation': 'upsert' },
			async () => {
				const [row] = await this.db
					.insert(storePreferences)
					.values({
						storeId,
						frontendUrl: config.frontendUrl ?? null,
						htmlTemplate: config.htmlTemplate ?? null,
					})
					.onConflictDoUpdate({
						target: storePreferences.storeId,
						set: {
							...(config.frontendUrl !== undefined && {
								frontendUrl: config.frontendUrl,
							}),
							...(config.htmlTemplate !== undefined && {
								htmlTemplate: config.htmlTemplate,
							}),
							updatedAt: new Date(),
						},
					})
					.returning();

				return StoreConfigMapper.toDomain(row);
			}
		);
	}
}
