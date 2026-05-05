import { createZodDto } from 'nestjs-zod';
import { createStoreRoleSchema } from '../../../domain/schemas/create-store-role.zodschema';

export class CreateStoreRoleDto extends createZodDto(createStoreRoleSchema) {}
