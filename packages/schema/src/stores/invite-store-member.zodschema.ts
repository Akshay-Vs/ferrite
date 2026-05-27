import { z } from 'zod/v4';

export const inviteStoreMemberSchema = z.object({
	email: z.email(),
	roleId: z.uuid(),
});

export type InviteStoreMemberInput = z.infer<typeof inviteStoreMemberSchema>;
