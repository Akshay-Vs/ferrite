import { registerSchema } from '@ferrite/schema/storefront-auth/register.zodschema';
import { createZodDto } from 'nestjs-zod';

export class RegisterInputDTO extends createZodDto(registerSchema) {}
