import type { ITransactionContext } from '@common/interfaces/unit-of-work.interface';
import type {
	Store,
	StoreMember,
	StoreRole,
} from '@core/database/schema/store.schema';
import type { PermissionKey } from '@ferrite/schema/common/permissions.zodschema';
import type { CreateStoreInput } from '@ferrite/schema/stores/create-store.zodschema';
import type { UpdateStoreInput } from '@ferrite/schema/stores/update-store.zodschema';

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
	 * Find all roles within a store.
	 */
	findRolesByStoreId(storeId: string): Promise<StoreRole[]>;

	/**
	 * Find all permissions for a specific role within a store.
	 */
	findRolePermissions(
		storeId: string,
		roleId: string
	): Promise<PermissionKey[]>;

	/**
	 * Find all members assigned to a specific role within a store.
	 */
	findRoleMembers(storeId: string, roleId: string): Promise<StoreMember[]>;

	/**
	 * Execute queries inside a transaction.
	 */
	transaction<T>(cb: (tx: ITransactionContext) => Promise<T>): Promise<T>;
}
