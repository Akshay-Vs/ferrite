import { z } from 'zod/v4';

export const userEventsSchema = z.enum([
	'user.created',
	'user.updated',
	'user.deleted',
]);

export const userEvents = userEventsSchema.enum;
export type UserEvent = z.infer<typeof userEventsSchema>;
