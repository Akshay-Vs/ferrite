import { z } from 'zod/v4';

export const StorefrontUserSchema = z.object({
	id: z.uuid(),
	storeId: z.uuid(),
	email: z.email(),
	emailVerifiedAt: z.date().nullable(),
	passwordHash: z.string().nullable(),
	mfaSecret: z.string().nullable(),
	mfaEnabled: z.boolean(),
	mfaRecoveryCodes: z.array(z.string()).nullable(),
	failedLoginCount: z.number().int().nonnegative(),
	lockedUntil: z.date().nullable(),
	displayName: z.string().nullable(),
	metadata: z.record(z.string(), z.unknown()).nullable(),
	lastLoginAt: z.date().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	bannedAt: z.date().nullable().optional(),
	deletedAt: z.date().nullable().optional(),
});

export type StorefrontUser = z.infer<typeof StorefrontUserSchema>;
