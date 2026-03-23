import { z } from 'zod/v4';

export const UserUpdatePayloadSchema = z
	.object({
		firstName: z.string().max(100),
		lastName: z.string().max(100),
		publicMetadata: z
			.object({
				role: z.string(),
			})
			.partial(),
	})
	.partial();

export type UserUpdatePayload = z.infer<typeof UserUpdatePayloadSchema>;
