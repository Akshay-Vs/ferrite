import { z } from 'zod/v4';
import { STORE_PERMISSIONS } from '../common/permissions.zodschema.ts';

export const createStoreRoleSchema = z.object({
	name: z.string().min(2).max(100),
	description: z.string().max(500).nullable().optional(),
	permissions: z.array(z.enum(STORE_PERMISSIONS)).min(1),
});

export type CreateStoreRoleInput = z.infer<typeof createStoreRoleSchema>;
