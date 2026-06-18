import type { ITransactionContext } from '@common/interfaces/unit-of-work.interface';
import type { NewStorefrontUserTable } from '@core/database/schema/storefront-user.schema';
import type { StorefrontUser } from '../schemas/storefront-user.zodschema';

export const STOREFRONT_USER_REPOSITORY = Symbol('IStorefrontUserRepository');

export interface IStorefrontUserRepository {
	create(
		data: NewStorefrontUserTable,
		tx?: ITransactionContext
	): Promise<StorefrontUser>;
	findByStoreIdAndEmail(
		storeId: string,
		email: string
	): Promise<StorefrontUser | null>;

	findByIdAndStoreId(
		id: string,
		storeId: string
	): Promise<StorefrontUser | null>;

	incrementFailedLogins(
		id: string,
		storeId: string,
		tx?: ITransactionContext
	): Promise<void>;

	resetFailedLogins(
		id: string,
		storeId: string,
		tx?: ITransactionContext
	): Promise<void>;

	updateLockedUntil(
		id: string,
		storeId: string,
		lockedUntil: Date | null,
		tx?: ITransactionContext
	): Promise<void>;

	ban(id: string, storeId: string, tx?: ITransactionContext): Promise<void>;

	softDelete(
		id: string,
		storeId: string,
		tx?: ITransactionContext
	): Promise<void>;

	getAllByStoreId(
		storeId: string,
		includeBanned?: boolean
	): Promise<StorefrontUser[]>;
}
