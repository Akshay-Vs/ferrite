import { DB, SUBSCRIBER_CLIENT } from '@core/database/db.provider';
import type { Psql, TDatabase } from '@core/database/db.type';
import {
	type OutboxEventRow,
	outboxEvents,
} from '@core/database/schema/outbox.schema';
import { traceDbOp } from '@core/database/utils/trace-db-op.util';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import type { IOutboxRepository } from '@modules/outbox/domain/ports/outbox-repository.port';
import type { DomainEvent } from '@modules/outbox/domain/schemas/domain-event';
import { Inject, Injectable } from '@nestjs/common';
import { eq, inArray, isNull, sql } from 'drizzle-orm';

@Injectable()
export class DrizzleOutboxRepository implements IOutboxRepository {
	constructor(
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		@Inject(DB) private readonly db: TDatabase,
		@Inject(SUBSCRIBER_CLIENT) private readonly psql: Psql
	) {}

	async insert(txRaw: unknown, entry: DomainEvent): Promise<string> {
		const tx = txRaw as Parameters<Parameters<TDatabase['transaction']>[0]>[0];
		return traceDbOp(
			this.tracer,
			'db.outboxEvents.insert',
			{ 'db.table': 'outbox_events', 'db.operation': 'insert' },
			async () => {
				const [inserted] = await tx
					.insert(outboxEvents)
					.values(entry)
					.returning({ id: outboxEvents.id });

				if (!inserted) {
					throw new Error('Outbox insert failed: no row returned');
				}

				return inserted.id;
			}
		);
	}

	async findPending(): Promise<any[]> {
		return traceDbOp(
			this.tracer,
			'db.outboxEvents.findPending',
			{ 'db.table': 'outbox_events', 'db.operation': 'select' },
			async () => {
				return this.db
					.select()
					.from(outboxEvents)
					.where(isNull(outboxEvents.processedAt))
					.limit(100);
			}
		);
	}

	async claimPendingBatch(
		_workerId: string,
		batchSize: number,
		cursor?: Date
	): Promise<OutboxEventRow[]> {
		return this.psql<OutboxEventRow[]>`
    UPDATE outbox_events
    SET
      status    = 'processing',
      locked_at = NOW()
    WHERE id IN (
      SELECT id FROM outbox_events
      WHERE status      = 'pending'
        AND (locked_at IS NULL OR locked_at < NOW() - INTERVAL '2 minutes')
        AND (${cursor ?? null}::timestamptz IS NULL
             OR created_at > ${cursor ?? null}::timestamptz)
      ORDER BY created_at ASC
      LIMIT ${batchSize}
      FOR UPDATE SKIP LOCKED
    )
    RETURNING *
  `;
	}

	async markProcessed(ids: string[]): Promise<void> {
		if (ids.length === 0) return;
		await this.db
			.update(outboxEvents)
			.set({
				status: 'processed',
				processedAt: sql`NOW()`,
			})
			.where(inArray(outboxEvents.id, ids));
	}

	async markFailed(id: string, error: string): Promise<void> {
		await this.db
			.update(outboxEvents)
			.set({
				status: sql`CASE WHEN retry_count + 1 >= max_retries THEN 'failed' ELSE 'pending' END`,
				retryCount: sql`retry_count + 1`,
				lockedAt: null,
				errorDetail: error,
			})
			.where(eq(outboxEvents.id, id));
	}
}
