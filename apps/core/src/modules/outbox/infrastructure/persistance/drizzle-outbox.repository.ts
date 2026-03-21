import { DB } from '@core/database/db.provider';
import { DrizzleTransaction, type TDatabase } from '@core/database/db.type';
import { outboxEvents } from '@core/database/schema';
import { IOutboxRepository } from '@modules/outbox/domain/ports/outbox-repository.port';
import { CreateOutboxEvent } from '@modules/outbox/domain/schemas/outbox-event.zodschema';
import { Inject, Injectable } from '@nestjs/common';
import { OutboxEventMapper } from './outbox-event.mapper';

@Injectable()
export class DrizzleOutboxRepository implements IOutboxRepository {
	constructor(@Inject(DB) private readonly db: TDatabase) {}

	async insert(
		event: CreateOutboxEvent,
		trx?: DrizzleTransaction
	): Promise<void> {
		const db = trx ?? this.db;
		await db
			.insert(outboxEvents)
			.values(OutboxEventMapper.toNewOutboxEvent(event));
	}
}
