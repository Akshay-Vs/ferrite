import { authProvidersSchema, UserUpdatePayloadSchema } from '@auth/index';
import { z } from 'zod/v4';

export const userUpdatedEventSchema = UserUpdatePayloadSchema.extend({
	externalAuthId: z.string(),
	provider: authProvidersSchema,
	eventType: z.literal('user.updated'),
});

export type UserUpdatedEvent = z.infer<typeof userUpdatedEventSchema>;
