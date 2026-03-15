import { z } from 'zod/v4';

export const userDeletedEventSchema = z.object({
	eventType: z.literal('user.deleted'),
	externalAuthId: z.string(),
	provider: z.string(),
});

export type UserDeletedEvent = z.infer<typeof userDeletedEventSchema>;
