import { z } from 'zod/v4';

export const createStoreSchema = z.object({
	name: z.string().min(2).max(150),
	slug: z
		.string()
		.min(2)
		.max(150)
		.regex(
			/^[a-z0-9-]+$/,
			'Slug must be alphanumeric, lowercase and can contain hyphens'
		),
	description: z.string().optional(),
	bannerUrl: z.string().url().max(2048).optional(),
	iconUrl: z.string().url().max(2048).optional(),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
