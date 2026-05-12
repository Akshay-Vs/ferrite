import { z } from 'zod/v4';
import { platformRoleSchema } from '../common/platform-roles.zodschema';

/**
 * Zod schema for the `PATCH /users/:id/role` admin request body.
 *
 * Ensures only valid platform roles are assigned.
 */
export const updateRoleSchema = z.object({
	role: platformRoleSchema,
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
