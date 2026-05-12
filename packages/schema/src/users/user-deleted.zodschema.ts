import { z } from 'zod/v4';
import { authProvidersSchema } from '../auth/auth-providers.zodschema';

export const userDeletedEventSchema = z.object({
	eventType: z.literal('user.deleted'),
	externalAuthId: z.string(),
	provider: authProvidersSchema,
});

export type UserDeletedEvent = z.infer<typeof userDeletedEventSchema>;
