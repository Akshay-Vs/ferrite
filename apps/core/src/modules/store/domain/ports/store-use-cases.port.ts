import type { ITransactionContext } from '@common/interfaces/unit-of-work.interface';
import { IUseCase } from '@common/interfaces/use-case.interface';
import type { Store } from '@core/database/schema/store.schema';
import type { CreateStoreInput } from '@ferrite/schema/stores/create-store.zodschema';
import type {
	GetAllStores,
	GetStore,
} from '@ferrite/schema/stores/get-store.zodschema';
import type { UpdateStoreInput } from '@ferrite/schema/stores/update-store.zodschema';
import type { StoreNotFoundError } from '../errors/store-not-found.error';

export const CREATE_STORE_UC = Symbol('CREATE_STORE_UC');
export const DELETE_STORE_UC = Symbol('DELETE_STORE_UC');
export const GET_OWN_STORES_UC = Symbol('GET_OWN_STORES_UC');
export const GET_PUBLIC_STORE_UC = Symbol('GET_PUBLIC_STORE_UC');
export const INITIALIZE_STORE_ORCHESTRATOR_UC = Symbol(
	'INITIALIZE_STORE_ORCHESTRATOR_UC'
);
export const UPDATE_STORE_UC = Symbol('UPDATE_STORE_UC');

export interface CreateStoreInputWithContext {
	tx?: ITransactionContext;
	input: CreateStoreInput;
	createdBy: string;
}

export interface InitializeStoreInput {
	input: CreateStoreInput;
	createdBy: string;
	tx?: ITransactionContext;
}

export interface UpdateStorePayload {
	storeId: string;
	data: UpdateStoreInput;
}

export type ICreateStoreUseCase = IUseCase<
	CreateStoreInputWithContext,
	Store,
	Error
>;
export type IDeleteStoreUseCase = IUseCase<string, void, StoreNotFoundError>;
export type IGetStoresUseCase = IUseCase<string, GetAllStores[], Error>;
export type IGetPublicStoreUseCase = IUseCase<
	string,
	GetStore,
	StoreNotFoundError
>;
export type IInitializeStoreOrchestratorUseCase = IUseCase<
	InitializeStoreInput,
	Store,
	Error
>;
export type IUpdateStoreUseCase = IUseCase<
	UpdateStorePayload,
	Store,
	StoreNotFoundError
>;
