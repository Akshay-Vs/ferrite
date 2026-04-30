import type {
	ITransactionContext,
	IUnitOfWork,
} from '@common/interfaces/unit-of-work.interface';
import { DB } from '@core/database/db.provider';
import type { DrizzleTransaction, TDatabase } from '@core/database/db.type';
import { Inject, Injectable } from '@nestjs/common';

/**
 * Branded wrapper that hides the Drizzle transaction behind `ITransactionContext`.
 *
 * Only infrastructure-layer code (repositories) should call `DrizzleUnitOfWork.unwrap()`
 * to access the underlying Drizzle transaction object.
 */
class DrizzleTransactionContext implements ITransactionContext {
	readonly _txBrand = Symbol('DrizzleTx');
	constructor(readonly _inner: DrizzleTransaction) {}
}

@Injectable()
export class DrizzleUnitOfWork implements IUnitOfWork {
	constructor(@Inject(DB) private readonly db: TDatabase) {}

	async execute<T>(work: (tx: ITransactionContext) => Promise<T>): Promise<T> {
		return this.db.transaction(async (drizzleTx) => {
			const ctx = new DrizzleTransactionContext(drizzleTx);
			return work(ctx);
		});
	}

	/**
	 * Unwrap an opaque `ITransactionContext` back to the real Drizzle transaction.
	 *
	 * **Infrastructure layer only** — never call this from domain or application code.
	 */
	static unwrap(ctx: ITransactionContext): DrizzleTransaction {
		if (!(ctx instanceof DrizzleTransactionContext)) {
			throw new Error(
				'Invalid ITransactionContext: expected DrizzleTransactionContext'
			);
		}
		return ctx._inner;
	}
}
