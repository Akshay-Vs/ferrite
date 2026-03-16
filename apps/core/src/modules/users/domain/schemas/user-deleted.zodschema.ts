import { authProvidersSchema } from '@auth/index';
import { z } from 'zod/v4';

export const userDeletedEventSchema = z.object({
	eventType: z.literal('user.deleted'),
	externalAuthId: z.string(),
	provider: authProvidersSchema,
});

export type UserDeletedEvent = z.infer<typeof userDeletedEventSchema>;
