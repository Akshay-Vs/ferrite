import type { ITransactionContext } from '@common/interfaces/unit-of-work.interface';
import { IUseCase } from '@common/interfaces/use-case.interface';
import { GetStoreInvitationResponse } from '@ferrite/schema/stores/get-store-invitation.zodschema';
import { EmailTransitError } from '@notifications/domain/errors/email-transit.error';
import { InvitationExpiredError } from '../errors/invitation-expired.error';
import { InvitationNotFoundError } from '../errors/invitation-not-found.error';
import type { MemberAlreadySuspendedError } from '../errors/member-already-suspended.error';
import type { MemberNotFoundError } from '../errors/member-not-found.error';
import type { MemberNotSuspendedError } from '../errors/member-not-suspended.error';
import type { OwnerProtectedError } from '../errors/owner-protected.error';

export const ADD_STORE_MEMBER_UC = Symbol('ADD_STORE_MEMBER_UC');
export const REMOVE_STORE_MEMBER_UC = Symbol('REMOVE_STORE_MEMBER_UC');
export const SUSPEND_STORE_MEMBER_UC = Symbol('SUSPEND_STORE_MEMBER_UC');
export const UNSUSPEND_STORE_MEMBER_UC = Symbol('UNSUSPEND_STORE_MEMBER_UC');
export const INVITE_STORE_MEMBER_UC = Symbol('INVITE_STORE_MEMBER_UC');
export const GET_STORE_INVITATION_UC = Symbol('GET_STORE_INVITATION_UC');
export const ACCEPT_STORE_INVITATION_UC = Symbol('ACCEPT_STORE_INVITATION_UC');

export interface AddStoreMemberInput {
	tx?: ITransactionContext;
	storeId: string;
	userId: string;
	roleId: string;
	isOwner: boolean;
}

export interface RemoveStoreMemberInput {
	tx?: ITransactionContext;
	storeId: string;
	roleId: string;
	userId: string;
}

export interface SuspendStoreMemberInput {
	tx?: ITransactionContext;
	storeId: string;
	roleId: string;
	userId: string;
}

export interface UnsuspendStoreMemberInput {
	tx?: ITransactionContext;
	storeId: string;
	roleId: string;
	userId: string;
}

export interface InviteStoreMemberInput {
	tx?: ITransactionContext;
	email: string;
	storeId: string;
	invitedBy: string;
	expiresAt: Date;
	token: string;
	roleId: string;
}

export interface GetStoreInvitationInput {
	invitationId: string;
	userEmail: string;
}

export interface AcceptStoreInvitationInput {
	tx?: ITransactionContext;
	invitationId: string;
	userId: string;
	userEmail: string;
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

export type IInviteStoreMemberUseCase = IUseCase<
	InviteStoreMemberInput,
	void,
	EmailTransitError | Error
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

export type GetStoreInvitationError =
	| InvitationNotFoundError
	| InvitationExpiredError
	| Error;

export type IGetStoreInvitationUseCase = IUseCase<
	GetStoreInvitationInput,
	GetStoreInvitationResponse,
	GetStoreInvitationError
>;

export type AcceptStoreInvitationError =
	| InvitationNotFoundError
	| InvitationExpiredError
	| Error;

export type IAcceptStoreInvitationUseCase = IUseCase<
	AcceptStoreInvitationInput,
	void,
	AcceptStoreInvitationError
>;
