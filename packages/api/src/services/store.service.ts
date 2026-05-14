import type { CreateStoreInput } from '@ferrite/schema/stores/create-store.zodschema';
import { createStoreSchema } from '@ferrite/schema/stores/create-store.zodschema';
import {
	type GetAllStores,
	type GetStore,
	getAllStoresSchema,
	getStoreSchema,
} from '@ferrite/schema/stores/get-store.zodschema';
import { z } from 'zod/v4';
import type { FerriteClient } from '../client';

export class StoreService {
	private readonly domain = 'stores';

	constructor(private readonly client: FerriteClient) {}

	public async createStore(payload: CreateStoreInput): Promise<GetStore> {
		return this.client.post(
			this.domain,
			getStoreSchema,
			payload,
			createStoreSchema
		);
	}

	public async getStore(id: string): Promise<GetStore> {
		return this.client.get(`${this.domain}/${id}`, getStoreSchema);
	}

	public async getAllStores(): Promise<GetAllStores[]> {
		return this.client.get(this.domain, z.array(getAllStoresSchema));
	}
}
