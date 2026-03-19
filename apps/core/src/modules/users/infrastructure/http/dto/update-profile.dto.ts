import { updateProfileSchema } from '@users/domain/schemas/update-profile.zodschema';
import { createZodDto } from 'nestjs-zod';

/**
 * NestJS DTO for the `PATCH /users/me` request body.
 *
 * Wraps the domain Zod schema with NestJS metadata (Swagger, validation pipe).
 * Intentionally placed in the infrastructure/http layer — the domain schema
 * itself remains framework-free.
 */
export class UpdateProfileInputDTO extends createZodDto(updateProfileSchema) {}
