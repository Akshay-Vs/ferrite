import { IUseCase } from '@common/interfaces/use-case.interface';
import { UserCreatedEvent } from '../schemas/user-created.zodschema';
import { UserDeletedEvent } from '../schemas/user-deleted.zodschema';
import { UserUpdatedEvent } from '../schemas/user-updated.zodschema';

export const CREATE_USER_UC = Symbol('CREATE_USER_UC');
export const UPDATE_USER_UC = Symbol('UPDATE_USER_UC');
export const DELETE_USER_UC = Symbol('DELETE_USER_UC');

export type ICreateUserUseCase = IUseCase<UserCreatedEvent, void>;
export type IUpdateUserUseCase = IUseCase<UserUpdatedEvent, void>;
export type IDeleteUserUseCase = IUseCase<UserDeletedEvent, void>;
