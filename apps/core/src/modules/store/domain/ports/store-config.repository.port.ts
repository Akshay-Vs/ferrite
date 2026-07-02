import { StoreConfig } from '@ferrite/schema/stores/store-config.zodschema';

export const STORE_CONFIG_REPOSITORY = Symbol('IStoreConfigRepository');

export interface IStoreConfigRepository {
	getConfig(storeId: string): Promise<StoreConfig | null>;
	upsertConfig(
		storeId: string,
		config: Partial<Omit<StoreConfig, 'storeId' | 'updatedAt'>>
	): Promise<StoreConfig>;
}
