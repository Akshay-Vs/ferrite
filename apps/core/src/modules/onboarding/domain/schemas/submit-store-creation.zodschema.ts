import { z } from 'zod/v4';

/**
 * Input schema for the "Store Creation" onboarding step.
 *
 * Mirrors the existing `createStoreSchema` from the Store module
 * to maintain validation parity.
 */
export const submitStoreCreationSchema = z.object({
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
	iconUrl: z.string().max(64).optional(),
	bannerUrl: z.url().max(2048).optional(),
});

export type SubmitStoreCreationInput = z.infer<
	typeof submitStoreCreationSchema
>;
