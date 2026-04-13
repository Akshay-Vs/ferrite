import { z } from 'zod/v4';
import { createStoreSchema } from './create-store.zodschema';

export const updateStoreSchema = createStoreSchema.partial();

export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
