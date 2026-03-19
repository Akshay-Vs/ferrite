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
}
