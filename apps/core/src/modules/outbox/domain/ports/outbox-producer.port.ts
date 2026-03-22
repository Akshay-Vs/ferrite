import { OutboxEvent } from '../schemas/outbox-event.zodschema';

export const OUTBOX_PRODUCER = Symbol('IOutboxProducer');

export interface IOutboxProducer {
	// called by the CDC listener after receiving a WAL event
	enqueue(event: OutboxEvent): Promise<void>;
}
