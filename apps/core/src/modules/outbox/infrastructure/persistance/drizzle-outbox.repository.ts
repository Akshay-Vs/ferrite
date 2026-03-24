import { DB } from '@core/database/db.provider';
import { DrizzleTransaction, type TDatabase } from '@core/database/db.type';
import { outboxEvents } from '@core/database/schema';
import { AppLogger } from '@core/logger/logger.service';
import type { ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer';
import { IOutboxRepository } from '@modules/outbox/domain/ports/outbox-repository.port';
import { CreateOutboxEvent } from '@modules/outbox/domain/schemas/outbox-event.zodschema';
import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { OutboxEventMapper } from './mappers/outbox-event.mapper';

@Injectable()
export class DrizzleOutboxRepository implements IOutboxRepository {
	constructor(
		@Inject(DB) private readonly db: TDatabase,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {}

	async insert(
		event: CreateOutboxEvent,
		trx?: DrizzleTransaction
	): Promise<void> {
		await this.tracer.withSpan(
			'outbox.insert',
			async () => {
				const db = trx ?? this.db;
				await db
					.insert(outboxEvents)
					.values(OutboxEventMapper.toNewOutboxEvent(event));
			},
			{
				'outbox.aggregate_type': event.aggregateType,
				'outbox.aggregate_id': event.aggregateId,
				'outbox.event_type': event.eventType,
				'outbox.queue_name': event.queueName,
			}
		);
	}

	async markDeadLettered(eventId: string, reason: string): Promise<void> {
		await this.tracer.withSpan(
			'outbox.mark_dead_lettered',
			async () => {
				const result = await this.db
					.update(outboxEvents)
					.set({
						status: 'dead_lettered',
						errorDetail: reason,
					})
					.where(eq(outboxEvents.id, eventId))
					.returning({
						id: outboxEvents.id,
					});

				if (result.length === 0) {
					this.logger.error(`Failed to mark dead lettered: eventId=${eventId}`);
				}
			},
			{ 'outbox.event_id': eventId }
		);
	}
}
