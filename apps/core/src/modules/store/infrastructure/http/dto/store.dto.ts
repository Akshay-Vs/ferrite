import { createZodDto } from 'nestjs-zod';
import { createStoreSchema } from '../../../domain/schemas/create-store.zodschema';
import { updateStoreSchema } from '../../../domain/schemas/update-store.zodschema';

export class CreateStoreDto extends createZodDto(createStoreSchema) {}

export class UpdateStoreDto extends createZodDto(updateStoreSchema) {}
