import type { AuthUser } from '@auth/index';
import { IUseCase } from '@common/interfaces/use-case.interface';
import { UserExistsError } from '../errors/user-exists.error';
import { UserNotFoundError } from '../errors/user-not-found.error';
import type { UpdateProfileInput } from '../schemas/update-profile.zodschema';
import { UserCreatedEvent } from '../schemas/user-created.zodschema';
import { UserDeletedEvent } from '../schemas/user-deleted.zodschema';
import type {
	UserProfileBase,
	UserProfileFull,
} from '../schemas/user-profile.zodschema';
import { UserUpdatedEvent } from '../schemas/user-updated.zodschema';

export const CREATE_USER_UC = Symbol('CREATE_USER_UC');
export const UPDATE_USER_UC = Symbol('UPDATE_USER_UC');
export const DELETE_USER_UC = Symbol('DELETE_USER_UC');

export const GET_USER_PROFILE_UC = Symbol('GET_USER_PROFILE_UC');
export const GET_OWN_PROFILE_UC = Symbol('GET_OWN_PROFILE_UC');
export const UPDATE_OWN_PROFILE_UC = Symbol('UPDATE_OWN_PROFILE_UC');

export type ICreateUserUseCase = IUseCase<
	UserCreatedEvent,
	void,
	UserExistsError
>;
export type IUpdateUserUseCase = IUseCase<
	UserUpdatedEvent,
	void,
	UserNotFoundError
>;
export type IDeleteUserUseCase = IUseCase<
	UserDeletedEvent,
	void,
	UserNotFoundError
>;

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
	void,
	UserNotFoundError
>;
