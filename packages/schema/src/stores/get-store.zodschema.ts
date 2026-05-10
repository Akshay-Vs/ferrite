import { z } from 'zod/v4';
import { createStoreSchema } from './create-store.zodschema.ts';

export const getStoreSchema = createStoreSchema.extend({
	id: z.string(),
	slug: z.string(),
	isActive: z.boolean(),
});

export const getAllStoresSchema = getStoreSchema
	.omit({
		description: true,
	})
	.extend({
		isOwner: z.boolean(),
	});

export type GetAllStores = z.infer<typeof getAllStoresSchema>;
export type GetStore = z.infer<typeof getStoreSchema>;
