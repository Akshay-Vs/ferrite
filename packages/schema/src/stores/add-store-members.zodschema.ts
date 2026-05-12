import { z } from 'zod/v4';

export const addStoreMembersSchema = z.object({
	userIds: z.array(z.uuid()).min(1),
	roleId: z.uuid(),
});

export type AddStoreMembersInput = z.infer<typeof addStoreMembersSchema>;
