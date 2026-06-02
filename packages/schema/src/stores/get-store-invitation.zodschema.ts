import { z } from 'zod/v4';

export const getStoreInvitationResponseSchema = z.object({
	id: z.uuid(),
	email: z.email(),
	status: z.enum(['pending', 'accepted', 'declined', 'expired']),
	store: z.object({
		id: z.uuid(),
		name: z.string(),
		slug: z.string(),
	}),
	role: z.object({
		id: z.uuid(),
		name: z.string(),
	}),
	invitedBy: z.object({
		fullName: z.string().nullable(),
		email: z.email(),
		avatarUrl: z.string().nullable(),
	}),
	invitedAt: z.iso.datetime(),
	expiresAt: z.iso.datetime(),
});

export type GetStoreInvitationResponse = z.infer<
	typeof getStoreInvitationResponseSchema
>;
