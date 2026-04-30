import { submitAboutMeSchema } from '@modules/onboarding/domain/schemas/submit-about-me.zodschema';
import { createZodDto } from 'nestjs-zod';

export class SubmitAboutMeDto extends createZodDto(submitAboutMeSchema) {}
