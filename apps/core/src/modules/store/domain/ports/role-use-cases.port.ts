import type { ITransactionContext } from '@common/interfaces/unit-of-work.interface';
import { IUseCase } from '@common/interfaces/use-case.interface';
import type {
	StoreMember,
	StoreRole,
} from '@core/database/schema/store.schema';
import type { PermissionKey } from '@ferrite/schema/common/permissions.zodschema';
import type { MemberNotFoundError } from '../errors/member-not-found.error';
import type { RoleHasMembersError } from '../errors/role-has-members.error';
import type { RoleNotFoundError } from '../errors/role-not-found.error';
import type { SystemRoleProtectedError } from '../errors/system-role-protected.error';

export const CHECK_STORE_PERMISSION_UC = Symbol('CHECK_STORE_PERMISSION_UC');
export const CREATE_STORE_ROLE_UC = Symbol('CREATE_STORE_ROLE_UC');
export const DELETE_STORE_ROLE_UC = Symbol('DELETE_STORE_ROLE_UC');
export const GET_ROLE_MEMBERS_UC = Symbol('GET_ROLE_MEMBERS_UC');
export const GET_ROLE_PERMISSIONS_UC = Symbol('GET_ROLE_PERMISSIONS_UC');
export const GET_STORE_ROLES_UC = Symbol('GET_STORE_ROLES_UC');
export const UPDATE_ROLE_PERMISSIONS_UC = Symbol('UPDATE_ROLE_PERMISSIONS_UC');

export interface CheckStorePermissionInput {
	userId: string;
	storeId: string;
	requiredPermissions: PermissionKey[];
}

export interface CreateStoreRoleInput {
	tx?: ITransactionContext;
	storeId: string;
	name: string;
	description: string | null;
	permissions: PermissionKey[];
	isSystem: boolean;
}

export interface DeleteStoreRoleInput {
	tx?: ITransactionContext;
	storeId: string;
	roleId: string;
}

export interface GetRoleMembersInput {
	storeId: string;
	roleId: string;
}

export interface GetRolePermissionsInput {
	storeId: string;
	roleId: string;
}

export interface UpdateRolePermissionsInput {
	tx?: ITransactionContext;
	storeId: string;
	roleId: string;
	permissions: PermissionKey[];
}

export type DeleteStoreRoleError =
	| RoleNotFoundError
	| SystemRoleProtectedError
	| RoleHasMembersError
	| Error;

export type UpdateRolePermissionsError =
	| RoleNotFoundError
	| SystemRoleProtectedError
	| Error;

export type ICheckStorePermissionUseCase = IUseCase<
	CheckStorePermissionInput,
	boolean,
	MemberNotFoundError
>;
export type ICreateStoreRoleUseCase = IUseCase<
	CreateStoreRoleInput,
	StoreRole,
	Error
>;
export type IDeleteStoreRoleUseCase = IUseCase<
	DeleteStoreRoleInput,
	void,
	DeleteStoreRoleError
>;
export type IGetRoleMembersUseCase = IUseCase<
	GetRoleMembersInput,
	StoreMember[],
	Error
>;
export type IGetRolePermissionsUseCase = IUseCase<
	GetRolePermissionsInput,
	PermissionKey[],
	Error
>;
export type IGetStoreRolesUseCase = IUseCase<string, StoreRole[], Error>;
export type IUpdateRolePermissionsUseCase = IUseCase<
	UpdateRolePermissionsInput,
	void,
	UpdateRolePermissionsError
>;
