import { z } from 'zod/v4';

/**
 * Read schema for a single store — intentionally independent from
 * `createStoreSchema` so that write-side validators (strict URL format,
 * uppercase currency regex, etc.) are NOT applied to the API response.
 * Optional fields use `nullish().transform()` to coerce API `null` → `undefined`.
 */
export const getStoreSchema = z.object({
	id: z.string(),
	slug: z.string(),
	name: z.string(),
	description: z
		.string()
		.nullish()
		.transform((v) => v ?? undefined),
	currencyCode: z.string(),
	storeIcon: z
		.string()
		.nullish()
		.transform((v) => v ?? undefined),
	bannerUrl: z
		.string()
		.nullish()
		.transform((v) => v ?? undefined),
	isActive: z.boolean(),
});

export const getAllStoresSchema = getStoreSchema
	.omit({
		description: true,
	})
	.extend({
		isOwner: z.boolean(),
	});

export const listOwnStoresSchema = z.object({
	items: z.array(getAllStoresSchema),
	nextCursor: z.string().optional(),
});

export type GetAllStores = z.infer<typeof getAllStoresSchema>;
export type GetStore = z.infer<typeof getStoreSchema>;
export type ListOwnStores = z.infer<typeof listOwnStoresSchema>;
