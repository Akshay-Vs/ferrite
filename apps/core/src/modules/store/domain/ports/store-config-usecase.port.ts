import { type IUseCase } from '@common/interfaces/use-case.interface';
import {
	type StoreConfig,
	type UpdateStoreConfigInput,
} from '@ferrite/schema/stores/store-config.zodschema';

export const GET_STORE_CONFIG_UC = Symbol('IGetStoreConfigUC');

export interface IGetStoreConfigUC
	extends IUseCase<{ storeId: string }, StoreConfig, Error> {}

export const UPDATE_STORE_CONFIG_UC = Symbol('IUpdateStoreConfigUC');

export interface IUpdateStoreConfigUC
	extends IUseCase<
		{ storeId: string; config: UpdateStoreConfigInput },
		StoreConfig,
		Error
	> {}
