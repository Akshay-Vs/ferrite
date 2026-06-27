import { z } from 'zod/v4';

export const emailVerificationSchema = z.object({
	id: z.uuid(),
	storeId: z.uuid(),
	userId: z.uuid(),
	tokenHash: z.string(),
	expiresAt: z.date(),
	createdAt: z.date(),
});

export type EmailVerification = z.infer<typeof emailVerificationSchema>;

export const createEmailVerificationSchema = emailVerificationSchema.pick({
	id: true,
	storeId: true,
	userId: true,
	tokenHash: true,
	expiresAt: true,
});

export type CreateEmailVerificationInput = z.infer<
	typeof createEmailVerificationSchema
>;
