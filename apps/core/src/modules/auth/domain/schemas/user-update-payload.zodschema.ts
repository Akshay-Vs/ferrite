import { z } from 'zod/v4';

/**
 * The payload schema that dispatches to third-party auth providers.
 * **/
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

/**
 * The payload schema type that dispatches to third-party auth providers.
 **/
export type UserUpdatePayload = z.infer<typeof UserUpdatePayloadSchema>;
