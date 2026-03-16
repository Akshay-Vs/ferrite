import { z } from 'zod/v4';
import { userCreatedEventSchema } from './user-created.zodschema';
import { userDeletedEventSchema } from './user-deleted.zodschema';
import { userUpdatedEventSchema } from './user-updated.zodschema';

export const userSyncEventSchema = z.discriminatedUnion('eventType', [
	userCreatedEventSchema,
	userUpdatedEventSchema,
	userDeletedEventSchema,
]);

export type UserSyncEvent = z.infer<typeof userSyncEventSchema>;
