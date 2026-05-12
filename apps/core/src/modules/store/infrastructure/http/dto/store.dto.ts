import { createStoreSchema } from '@ferrite/schema/stores/create-store.zodschema';
import { updateStoreSchema } from '@ferrite/schema/stores/update-store.zodschema';
import { createZodDto } from 'nestjs-zod';

export class CreateStoreDto extends createZodDto(createStoreSchema) {}

export class UpdateStoreDto extends createZodDto(updateStoreSchema) {}
