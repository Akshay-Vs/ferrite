import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/v4';

/**
 * Zod schema for the `PATCH /users/me` request body.
 *
 * Only self-service-safe fields are allowed — email, role, and ban
 * status changes are intentionally excluded and delegated to admin.
 */
export const updateProfileSchema = z
	.object({
		firstName: z.string().max(100),
		lastName: z.string().max(100),
		avatarUrl: z.url().max(2048),
		dateOfBirth: z.iso.date(),
		preferredLocale: z.string().max(10),
		preferredCurrency: z.string().length(3),
	})
	.partial();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export class UpdateProfileInputDTO extends createZodDto(updateProfileSchema) {}
