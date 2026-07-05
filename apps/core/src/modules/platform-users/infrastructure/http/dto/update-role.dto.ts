import { updateRoleSchema } from '@ferrite/schema/users/update-role.zodschema';
import { createZodDto } from 'nestjs-zod';

export class UpdateRoleInputDTO extends createZodDto(updateRoleSchema) {}
