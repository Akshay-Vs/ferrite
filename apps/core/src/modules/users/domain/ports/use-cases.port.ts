import type { AuthUser } from '@auth/index';
import { IUseCase } from '@common/interfaces/use-case.interface';
import { UserConflictError } from '../errors/user-conflict.error';
import { UserExistsError } from '../errors/user-exists.error';
import { UserNotFoundError } from '../errors/user-not-found.error';
import type { UpdateProfileInput } from '../schemas/update-profile.zodschema';
import { UserCreatedEvent } from '../schemas/user-created.zodschema';
import type {
	UserProfileBase,
	UserProfileFull,
} from '../schemas/user-profile.zodschema';
import { UserUpdatedEvent } from '../schemas/user-updated.zodschema';

export const CREATE_USER_UC = Symbol('CREATE_USER_UC');
export const UPDATE_USER_UC = Symbol('UPDATE_USER_UC');
export const DELETE_USER_UC = Symbol('DELETE_USER_UC');

export const GET_OWN_PROFILE_UC = Symbol('GET_OWN_PROFILE_UC');
export const UPDATE_OWN_PROFILE_UC = Symbol('UPDATE_OWN_PROFILE_UC');

export type ICreateUserUseCase = IUseCase<
	UserCreatedEvent,
	void,
	UserExistsError | UserConflictError
>;
export type IUpdateUserUseCase = IUseCase<
	UserUpdatedEvent,
	void,
	UserNotFoundError
>;
export type IDeleteUserUseCase = IUseCase<AuthUser, boolean, UserNotFoundError>;

export type IGetUserProfileUseCase = IUseCase<
	string,
	UserProfileBase,
	UserNotFoundError
>;
export type IGetOwnProfileUseCase = IUseCase<
	AuthUser,
	UserProfileFull,
	UserNotFoundError
>;
export type IUpdateOwnProfileUseCase = IUseCase<
	{ authUser: AuthUser; data: UpdateProfileInput },
	UserProfileFull,
	UserNotFoundError
>;
