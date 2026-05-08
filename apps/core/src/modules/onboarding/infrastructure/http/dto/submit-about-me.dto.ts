import { onboardingAboutUserSchema } from '@ferrite/schema';
import { createZodDto } from 'nestjs-zod';

export class OnboardingAboutUserDto extends createZodDto(
	onboardingAboutUserSchema
) {}
