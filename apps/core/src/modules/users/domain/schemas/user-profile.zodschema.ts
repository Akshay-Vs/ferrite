import { z } from 'zod/v4';

/**
 * Response DTO schema for user profile endpoints.
 *
 * Exposes only public-safe fields — internal fields like `deletedAt`,
 * `banReason`, and `isBanned` are excluded from the API surface.
 */

export const userProfileBaseSchema = z.object({
	id: z.uuid(),
	email: z.string(),
	emailVerified: z.boolean(),
	firstName: z.string().nullable(),
	lastName: z.string().nullable(),
	avatarUrl: z.string().nullable(),
	isActive: z.boolean(),
});

export const userProfileFullSchema = userProfileBaseSchema.extend({
	dateOfBirth: z.string().nullable(),
	preferredLocale: z.string().nullable(),
	preferredCurrency: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export type UserProfileBase = z.infer<typeof userProfileBaseSchema>;
export type UserProfileFull = z.infer<typeof userProfileFullSchema>;
