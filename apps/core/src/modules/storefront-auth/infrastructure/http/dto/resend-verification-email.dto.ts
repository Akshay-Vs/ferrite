import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/v4';

export const ResendVerificationEmailSchema = z.object({
	userId: z.uuid(),
	email: z.email(),
});

export class ResendVerificationEmailDTO extends createZodDto(
	ResendVerificationEmailSchema
) {}
