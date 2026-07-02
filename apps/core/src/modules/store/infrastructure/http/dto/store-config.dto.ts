import { UpdateStoreConfigSchema } from '@ferrite/schema/stores/store-config.zodschema';
import { createZodDto } from 'nestjs-zod';

export class UpdateStoreConfigDto extends createZodDto(
	UpdateStoreConfigSchema
) {}
