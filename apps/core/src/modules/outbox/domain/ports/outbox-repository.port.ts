import type { DrizzleTransaction } from '@core/database/db.type';
import type { NewOutboxEvent } from '@core/database/schema/outbox.schema';

export const OUTBOX_REPOSITORY = Symbol('OUTBOX_REPOSITORY');

/**
 * Outbox persistence port.
 *
 * Provides the contract for writing outbox entries. The `insert` method
 * accepts a Drizzle transaction so callers can wrap the outbox write in
 * the same transaction as the aggregate mutation.
 */
export interface IOutboxRepository {
	/**
	 * Insert an outbox entry within the given transaction.
	 * @param tx  Active Drizzle transaction.
	 * @param entry  Outbox event data to persist.
	 * @returns The generated outbox event id.
	 */
	insert(
		tx: DrizzleTransaction,
		entry: Omit<NewOutboxEvent, 'id' | 'createdAt'>
	): Promise<string>;
}
