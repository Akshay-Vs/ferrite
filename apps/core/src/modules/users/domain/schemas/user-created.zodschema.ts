import { authProvidersSchema } from '@auth/domain/schemas/auth-providers.zodschema';
import { z } from 'zod/v4';

export const userCreatedEventSchema = z.object({
	eventType: z.literal('user.created'),

	// Identity
	externalAuthId: z.string(),
	provider: authProvidersSchema,
	oauthProvider: z.string().nullable(), // google, facebook, etc

	// Contact
	email: z.email(),
	emailVerified: z.boolean(),
	phoneNumber: z.string().nullable(),
	phoneVerified: z.boolean(),

	// Profile
	username: z.string().nullable(),
	firstName: z.string().nullable(),
	lastName: z.string().nullable(),
	avatarUrl: z.string().nullable(),
	locale: z.string().nullable(),

	// Security
	twoFactorEnabled: z.boolean(),

	// Account status
	banned: z.boolean(),
	locked: z.boolean(),

	// Timestamps from auth provider
	providerCreatedAt: z.number(), // ms epoch
	providerUpdatedAt: z.number(),
	lastSignInAt: z.number().nullable(),
});

export type UserCreatedEvent = z.infer<typeof userCreatedEventSchema>;
