import { createStoreRoleSchema } from '@ferrite/schema/stores/create-store-role.zodschema';
import { createZodDto } from 'nestjs-zod';

export class CreateStoreRoleDto extends createZodDto(createStoreRoleSchema) {}
