import type { DomainEvent } from '../schemas/domain-event';

export const OUTBOX_REPOSITORY = Symbol('OUTBOX_REPOSITORY');

/**
 * Outbox persistence port.
 *
 * Provides the contract for writing outbox entries. The `insert` method
 * accepts an opaque transaction handle so callers can wrap the outbox
 * write in the same transaction as the aggregate mutation.
 */
export interface IOutboxRepository {
	/**
	 * Insert an outbox entry within the given transaction.
	 * @param tx     Active transaction handle (opaque to the port).
	 * @param entry  Domain event data to persist.
	 * @returns The generated outbox event id.
	 */
	insert(tx: unknown, entry: DomainEvent): Promise<string>;

	/**
	 * Fetch outbox events that have not been processed yet.
	 * Returns recent pending events.
	 */
	findPending(): Promise<any[]>;

	/**
	 * Claim a batch of pending events for processing.
	 * @param workerId  Worker ID to claim events for.
	 * @param batchSize Maximum number of events to claim.
	 * @param cursor    Cursor to start from (optional).
	 * @returns A batch of pending events.
	 */
	claimPendingBatch(
		workerId: string,
		batchSize: number,
		cursor?: Date
	): Promise<any[]>;

	/**
	 * Mark events as successfully processed.
	 * @param ids  Event IDs to mark.
	 */
	markProcessed(ids: string[]): Promise<void>;

	/**
	 * Mark a single event as failed, incrementing retry_count.
	 * Resets to 'pending' for retry unless max retries reached.
	 */
	markFailed(id: string, error: string): Promise<void>;
}
