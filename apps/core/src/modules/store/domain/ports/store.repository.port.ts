import type { PermissionKey } from '@common/schemas/permissions.zodschema';
import type { Store, StoreRole } from '@core/database/schema/store.schema';
import type { CreateStoreInput } from '../schemas/create-store.zodschema';
import type { UpdateStoreInput } from '../schemas/update-store.zodschema';

export const STORE_REPOSITORY = Symbol('STORE_REPOSITORY');

export interface IStoreRepository {
	/**
	 * Creates a new Store.
	 */
	createStore(
		tx: unknown,
		input: CreateStoreInput,
		createdBy: string
	): Promise<Store>;

	/**
	 * Soft deletes a store by its ID.
	 */
	softDeleteStore(tx: unknown, storeId: string): Promise<boolean>;

	/**
	 * Updates a store by its ID.
	 */
	updateStore(
		tx: unknown,
		storeId: string,
		payload: UpdateStoreInput
	): Promise<Store | null>;

	/**
	 * Creates a store role with specific permissions.
	 */
	createStoreRole(
		tx: unknown,
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
		tx: unknown,
		storeId: string,
		userId: string,
		roleId: string,
		isOwner: boolean
	): Promise<void>;

	/**
	 * Find store by ID.
	 */
	findById(storeId: string): Promise<Store | null>;

	/**
	 * Returns stores created by or member of.
	 */
	findByUserId(userId: string): Promise<Store[]>;

	/**
	 * Execute queries inside a transaction.
	 */
	transaction<T>(cb: (tx: unknown) => Promise<T>): Promise<T>;
}
