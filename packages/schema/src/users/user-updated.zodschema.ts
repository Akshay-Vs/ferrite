import { z } from 'zod/v4';
import { authProvidersSchema } from '../auth/auth-providers.zodschema';
import { UserUpdatePayloadSchema } from '../auth/user-update-payload.zodschema';

export const userUpdatedEventSchema = UserUpdatePayloadSchema.extend({
	externalAuthId: z.string(),
	provider: authProvidersSchema,
	eventType: z.literal('user.updated'),
});

export type UserUpdatedEvent = z.infer<typeof userUpdatedEventSchema>;
