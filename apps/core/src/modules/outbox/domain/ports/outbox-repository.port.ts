import { CreateOutboxEvent } from '../schemas/outbox-event.zodschema';

export const OUTBOX_REPOSITORY = Symbol('IOutboxRepository');

export interface IOutboxRepository {
	// called by domain modules inside their own transaction
	insert(event: CreateOutboxEvent, trx?: unknown): Promise<void>;
}
