import { traceDbOp } from '@common/utils/trace-db-op.util';
import type { TDatabase } from '@core/database/db.type';
import type { NewOutboxEvent } from '@core/database/schema/outbox.schema';
import { outboxEvents } from '@core/database/schema/outbox.schema';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import type { IOutboxRepository } from '@modules/outbox/domain/ports/outbox-repository.port';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DrizzleOutboxRepository implements IOutboxRepository {
	constructor(@Inject(OTEL_TRACER) private readonly tracer: ITracer) {}

	async insert(
		tx: Parameters<Parameters<TDatabase['transaction']>[0]>[0],
		entry: Omit<NewOutboxEvent, 'id' | 'createdAt'>
	): Promise<string> {
		return traceDbOp(
			this.tracer,
			'db.outboxEvents.insert',
			{ 'db.table': 'outbox_events', 'db.operation': 'insert' },
			async () => {
				const [inserted] = await tx
					.insert(outboxEvents)
					.values(entry)
					.returning({ id: outboxEvents.id });

				return inserted.id;
			}
		);
	}
}
