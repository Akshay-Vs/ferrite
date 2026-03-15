import { z } from 'zod/v4';
import { userCreatedEventSchema } from './user-created.zodschema';

export const userUpdatedEventSchema = userCreatedEventSchema.extend({
	eventType: z.literal('user.updated'),
});

export type UserUpdatedEvent = z.infer<typeof userUpdatedEventSchema>;
