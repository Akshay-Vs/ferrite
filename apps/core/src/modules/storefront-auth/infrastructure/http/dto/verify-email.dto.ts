import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/v4';

export const VerifyEmailSchema = z.object({
	userId: z.uuid(),
	token: z.string().min(1),
});

export class VerifyEmailDTO extends createZodDto(VerifyEmailSchema) {}
