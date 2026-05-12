import z from 'zod';
import { userProfileFullSchema } from './user-profile.zodschema';

export const listAllUsersSchema = z.object({
	items: z.array(userProfileFullSchema),
	nextCursor: z.string().optional(),
});

export type ListAllUsers = z.infer<typeof listAllUsersSchema>;
