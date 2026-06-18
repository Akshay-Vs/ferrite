import { z } from 'zod/v4';

export const storefrontUserSchema = z.object({
	id: z.uuid(),
	storeId: z.uuid().describe('The ID of the store this user belongs to'),
	displayName: z.string().nullable(),

	email: z.email(),
	emailVerifiedAt: z.date().nullable(),
	passwordHash: z.string().nullable(),

	mfaSecret: z.string().nullable(),
	mfaEnabled: z.boolean(),
	mfaRecoveryCodes: z.array(z.string()).nullable(),

	failedLoginCount: z.number().int().nonnegative(),
	lockedUntil: z.date().nullable(),

	metadata: z.record(z.string(), z.unknown()).default({}),

	lastLoginAt: z.date().nullable(),
	bannedAt: z.date().nullable().optional(),

	createdAt: z.date(),
	updatedAt: z.date(),
	deletedAt: z.date().nullable().optional(),
});

export const storefrontUserResponseSchema = storefrontUserSchema
	.pick({
		id: true,
		storeId: true,
		email: true,
		displayName: true,
		mfaEnabled: true,
		metadata: true,
		createdAt: true,
		updatedAt: true,
	})
	.extend({
		emailVerified: z.boolean().default(false),
	});

export const createStorefrontUserSchema = storefrontUserSchema.pick({
	id: true,
	storeId: true,
	email: true,
	displayName: true,
	passwordHash: true,
});

export type StorefrontUser = z.infer<typeof storefrontUserSchema>;
export type StorefrontUserResponse = z.infer<
	typeof storefrontUserResponseSchema
>;
export type CreateStorefrontUserInput = z.infer<
	typeof createStorefrontUserSchema
>;
