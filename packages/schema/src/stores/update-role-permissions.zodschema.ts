import { z } from 'zod/v4';
import { STORE_PERMISSIONS } from '../common/permissions.zodschema.ts';

export const updateRolePermissionsSchema = z.object({
	permissions: z.array(z.enum(STORE_PERMISSIONS)).min(1),
});

export type UpdateRolePermissionsInput = z.infer<
	typeof updateRolePermissionsSchema
>;
