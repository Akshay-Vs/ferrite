import type { OutboxEvent } from '@core/database/schema';

export const OUTBOX_DISPATCHER = Symbol('IOutboxDispatcher');

/**
 * Driven port for dispatching outbox events to a message queue.
 *
 * Consumed by: OutboxWorker
 * Implemented by: OutboxDispatcherQueue (BullMQ adapter)
 */
export interface IOutboxDispatcher {
	/**
	 * Enqueue an outbox event for downstream processing.
	 * @param event  The full outbox event row.
	 */
	dispatch(event: OutboxEvent): Promise<void>;
}
