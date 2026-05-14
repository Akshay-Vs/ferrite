import { z } from 'zod/v4';

export const createStoreSchema = z.object({
	name: z.string().min(2).max(150),
	description: z
		.string()
		.min(1, { message: 'Store description is required' })
		.max(255)
		.optional(),
	currencyCode: z
		.string()
		.length(3)
		.regex(/^[A-Z]{3}$/),
	storeIcon: z
		.string()
		.min(1, {
			message: 'Select an icon for your store, search for more icons',
		})
		.max(255)
		.optional(),
	bannerUrl: z.url().max(2048).optional(),
});

// Step 1
export const storeCreateStepSchema = createStoreSchema.pick({
	name: true,
	description: true,
});

// Step 2 — wizard always collects an icon; full create payload may omit `storeIcon`.
export const storeConfigureStepSchema = z.object({
	currencyCode: createStoreSchema.shape.currencyCode,
	storeIcon: z
		.string()
		.min(1, {
			message: 'Select an icon for your store, search for more icons',
		})
		.max(255),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
