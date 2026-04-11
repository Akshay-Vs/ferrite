import { platformRoleEnum } from '@core/database/schema';
import { z } from 'zod/v4';

/**
 * Zod schema for the `PATCH /users/:id/role` admin request body.
 *
 * Ensures only valid platform roles are assigned.
 */
export const updateRoleSchema = z.object({
	role: z.enum(platformRoleEnum.enumValues),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
