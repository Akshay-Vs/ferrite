/**
 * Opaque marker for a database transaction context.
 *
 * Domain and Application layers see only this branded interface —
 * never the concrete Drizzle transaction type. Infrastructure adapters
 * (repositories) unwrap it to the real transaction via a static helper.
 */
export interface ITransactionContext {
	/** Nominal brand — prevents plain objects from satisfying this type. */
	readonly _txBrand: symbol;
}

export const UNIT_OF_WORK = Symbol('UNIT_OF_WORK');

/**
 * Port for executing multiple repository operations atomically.
 *
 * Usage (application layer):
 * ```ts
 * await this.uow.execute(async (tx) => {
 *   await this.repoA.update(id, data, tx);
 *   await this.repoB.insert(row, tx);
 * });
 * ```
 *
 * If the callback throws, the transaction is rolled back automatically.
 */
export interface IUnitOfWork {
	execute<T>(work: (tx: ITransactionContext) => Promise<T>): Promise<T>;
}
