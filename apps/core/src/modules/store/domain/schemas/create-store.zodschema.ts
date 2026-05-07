import { z } from 'zod/v4';

export const createStoreSchema = z.object({
	name: z.string().min(2).max(150),
	description: z.string().optional(),
	currencyCode: z
		.string()
		.length(3)
		.regex(/^[A-Z]{3}$/),
	bannerUrl: z.url().max(2048).optional(),
	storeIcon: z.string().max(256).optional(),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
