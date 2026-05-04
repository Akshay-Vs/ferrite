import type { ITransactionContext } from '@common/interfaces/unit-of-work.interface';
import type { PermissionKey } from '@common/schemas/permissions.zodschema';
import type { Store, StoreRole } from '@core/database/schema/store.schema';
import type { CreateStoreInput } from '../schemas/create-store.zodschema';
import type { UpdateStoreInput } from '../schemas/update-store.zodschema';

export const STORE_REPOSITORY = Symbol('STORE_REPOSITORY');

/**
 * A store with the requesting user's membership context.
 */
export interface StoreMembership extends Store {
	isOwner: boolean;
}

export interface IStoreRepository {
	/**
	 * Creates a new Store.
	 */
	createStore(
		tx: ITransactionContext | undefined,
		input: CreateStoreInput,
		createdBy: string
	): Promise<Store>;

	/**
	 * Soft deletes a store by its ID.
	 */
	softDeleteStore(
		tx: ITransactionContext | undefined,
		storeId: string
	): Promise<boolean>;

	/**
	 * Updates a store by its ID.
	 */
	updateStore(
		tx: ITransactionContext | undefined,
		storeId: string,
		payload: UpdateStoreInput
	): Promise<Store | null>;

	/**
	 * Creates a store role with specific permissions.
	 */
	createStoreRole(
		tx: ITransactionContext | undefined,
		storeId: string,
		name: string,
		description: string | null,
		isSystem: boolean,
		permissions: PermissionKey[]
	): Promise<StoreRole>;

	/**
	 * Adds a user as a member of a store with a specific role.
	 */
	addStoreMember(
		tx: ITransactionContext | undefined,
		storeId: string,
		userId: string,
		roleId: string,
		isOwner: boolean
	): Promise<void>;

	/**
	 * Adds multiple users as members of a store with a specific role.
	 */
	addStoreMembers(
		tx: ITransactionContext | undefined,
		storeId: string,
		userIds: string[],
		roleId: string,
		isOwner: boolean
	): Promise<void>;

	/**
	 * Find store by ID.
	 */
	findById(storeId: string): Promise<Store | null>;

	/**
	 * Returns all stores where the user is a member, with ownership status.
	 */
	findByUserId(userId: string): Promise<StoreMembership[]>;

	/**
	 * Execute queries inside a transaction.
	 */
	transaction<T>(cb: (tx: ITransactionContext) => Promise<T>): Promise<T>;
}
