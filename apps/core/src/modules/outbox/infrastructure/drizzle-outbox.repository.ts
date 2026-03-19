import type { TDatabase } from '@core/database/db.type';
import { outboxEvents } from '@core/database/schema/outbox.schema';
import { traceDbOp } from '@core/database/utils/trace-db-op.util';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import type { IOutboxRepository } from '@modules/outbox/domain/ports/outbox-repository.port';
import type { DomainEvent } from '@modules/outbox/domain/schemas/domain-event';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DrizzleOutboxRepository implements IOutboxRepository {
	constructor(@Inject(OTEL_TRACER) private readonly tracer: ITracer) {}

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
}
