import { onboardingStoreCreateSchema } from '@ferrite/schema';
import { createZodDto } from 'nestjs-zod';

export class OnboardingStoreCreationDto extends createZodDto(
	onboardingStoreCreateSchema
) {}
