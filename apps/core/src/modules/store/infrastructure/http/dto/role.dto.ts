import { createStoreRoleSchema } from '@ferrite/schema/stores/create-store-role.zodschema';
import { updateRolePermissionsSchema } from '@ferrite/schema/stores/update-role-permissions.zodschema';
import { createZodDto } from 'nestjs-zod';

export class CreateStoreRoleDto extends createZodDto(createStoreRoleSchema) {}

export class UpdateRolePermissionsDto extends createZodDto(
	updateRolePermissionsSchema
) {}
