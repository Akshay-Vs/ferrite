import { submitStoreCreationSchema } from '@modules/onboarding/domain/schemas/submit-store-creation.zodschema';
import { createZodDto } from 'nestjs-zod';

export class SubmitStoreCreationDto extends createZodDto(
	submitStoreCreationSchema
) {}
