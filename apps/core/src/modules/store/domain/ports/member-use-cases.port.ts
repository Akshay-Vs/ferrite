import type { ITransactionContext } from '@common/interfaces/unit-of-work.interface';
import { IUseCase } from '@common/interfaces/use-case.interface';
import type { MemberAlreadySuspendedError } from '../errors/member-already-suspended.error';
import type { MemberNotFoundError } from '../errors/member-not-found.error';
import type { MemberNotSuspendedError } from '../errors/member-not-suspended.error';
import type { OwnerProtectedError } from '../errors/owner-protected.error';

export const ADD_STORE_MEMBER_UC = Symbol('ADD_STORE_MEMBER_UC');
export const ADD_STORE_MEMBERS_UC = Symbol('ADD_STORE_MEMBERS_UC');
export const REMOVE_STORE_MEMBER_UC = Symbol('REMOVE_STORE_MEMBER_UC');
export const SUSPEND_STORE_MEMBER_UC = Symbol('SUSPEND_STORE_MEMBER_UC');
export const UNSUSPEND_STORE_MEMBER_UC = Symbol('UNSUSPEND_STORE_MEMBER_UC');

export interface AddStoreMemberInput {
	tx?: ITransactionContext;
	storeId: string;
	userId: string;
	roleId: string;
	isOwner: boolean;
}

export interface AddStoreMembersInput {
	tx?: ITransactionContext;
	storeId: string;
	userIds: string[];
	roleId: string;
	isOwner?: boolean;
}

export interface RemoveStoreMemberInput {
	tx?: ITransactionContext;
	storeId: string;
	userId: string;
}

export interface SuspendStoreMemberInput {
	tx?: ITransactionContext;
	storeId: string;
	userId: string;
}

export interface UnsuspendStoreMemberInput {
	tx?: ITransactionContext;
	storeId: string;
	userId: string;
}

export type RemoveStoreMemberError =
	| MemberNotFoundError
	| OwnerProtectedError
	| Error;

export type SuspendStoreMemberError =
	| MemberNotFoundError
	| OwnerProtectedError
	| MemberAlreadySuspendedError
	| Error;

export type UnsuspendStoreMemberError =
	| MemberNotFoundError
	| MemberNotSuspendedError
	| Error;

export type IAddStoreMemberUseCase = IUseCase<AddStoreMemberInput, void, Error>;
export type IAddStoreMembersUseCase = IUseCase<
	AddStoreMembersInput,
	void,
	Error
>;
export type IRemoveStoreMemberUseCase = IUseCase<
	RemoveStoreMemberInput,
	void,
	RemoveStoreMemberError
>;
export type ISuspendStoreMemberUseCase = IUseCase<
	SuspendStoreMemberInput,
	void,
	SuspendStoreMemberError
>;
export type IUnsuspendStoreMemberUseCase = IUseCase<
	UnsuspendStoreMemberInput,
	void,
	UnsuspendStoreMemberError
>;
