import { updateRoleSchema } from '@users/domain/schemas/update-role.zodschema';
import { createZodDto } from 'nestjs-zod';

export class UpdateRoleInputDTO extends createZodDto(updateRoleSchema) {}
