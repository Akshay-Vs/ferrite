import { loginSchema } from '@ferrite/schema/storefront-auth/login.zodschema';
import { createZodDto } from 'nestjs-zod';

export class LoginInputDTO extends createZodDto(loginSchema) {}
