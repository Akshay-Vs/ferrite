import type { ITransactionContext } from '@common/interfaces/unit-of-work.interface';
import type {
	Store,
	StoreMember,
	StoreRole,
} from '@core/database/schema/store.schema';
import type { PermissionKey } from '@ferrite/schema/common/permissions.zodschema';
import type { CreateStoreInput } from '@ferrite/schema/stores/create-store.zodschema';
import { GetAllStores } from '@ferrite/schema/stores/get-store.zodschema';
import { GetStoreInvitationResponse } from '@ferrite/schema/stores/get-store-invitation.zodschema';
import type { UpdateStoreInput } from '@ferrite/schema/stores/update-store.zodschema';

export const STORE_REPOSITORY = Symbol('STORE_REPOSITORY');

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
	 * Invites a user as a member of a store with a specific role.
	 */
	inviteStoreMember(
		tx: ITransactionContext | undefined,
		email: string,
		storeId: string,
		invitedBy: string,
		expiresAt: Date,
		token: string,
		roleId: string
	): Promise<void>;

	/**
	 * Find an invitation by ID and ensure it belongs to the given email.
	 * Returns detailed invitation information including the store, role, and inviter.
	 */
	findInvitationByIdAndEmail(
		id: string,
		email: string
	): Promise<GetStoreInvitationResponse | null>;

	/**
	 * Accept a store invitation. Updates the status to 'accepted'.
	 */
	acceptInvitation(
		tx: ITransactionContext | undefined,
		id: string
	): Promise<void>;

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
	findByUserId(userId: string): Promise<GetAllStores[]>;

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
	 * Deletes a store role by ID. Only non-system roles can be deleted.
	 * Returns the deleted role, or null if not found.
	 */
	deleteStoreRole(
		tx: ITransactionContext | undefined,
		storeId: string,
		roleId: string
	): Promise<StoreRole | null>;

	/**
	 * Removes a member from a store entirely.
	 * Returns true if a row was deleted, false if the member was not found.
	 */
	removeStoreMember(
		tx: ITransactionContext | undefined,
		storeId: string,
		roleId: string,
		userId: string
	): Promise<boolean>;

	/**
	 * Replaces all permissions for a role with the given set.
	 * Deletes existing permissions, inserts the new set.
	 */
	updateRolePermissions(
		tx: ITransactionContext | undefined,
		storeId: string,
		roleId: string,
		permissions: PermissionKey[]
	): Promise<boolean>;

	/**
	 * Find a specific role by ID within a store.
	 */
	findRoleById(
		tx: ITransactionContext | undefined,
		storeId: string,
		roleId: string
	): Promise<StoreRole | null>;

	/**
	 * Check if a member is the store owner.
	 */
	isMemberOwner(
		tx: ITransactionContext | undefined,
		storeId: string,
		userId: string
	): Promise<boolean>;

	/**
	 * Count members assigned to a specific role.
	 */
	countRoleMembers(
		tx: ITransactionContext | undefined,
		storeId: string,
		roleId: string
	): Promise<number>;

	/**
	 * Sets suspendedAt on a member. Returns true if updated.
	 */
	suspendMember(
		tx: ITransactionContext | undefined,
		storeId: string,
		roleId: string,
		userId: string
	): Promise<boolean>;

	/**
	 * Clears suspendedAt on a member. Returns true if updated.
	 */
	unsuspendMember(
		tx: ITransactionContext | undefined,
		storeId: string,
		roleId: string,
		userId: string
	): Promise<boolean>;

	/**
	 * Check if a member is currently suspended.
	 * Returns null if the user is not a member of the store.
	 */
	isMemberSuspended(
		tx: ITransactionContext | undefined,
		storeId: string,
		userId: string
	): Promise<boolean | null>;

	/**
	 * Execute queries inside a transaction.
	 */
	transaction<T>(cb: (tx: ITransactionContext) => Promise<T>): Promise<T>;
}
