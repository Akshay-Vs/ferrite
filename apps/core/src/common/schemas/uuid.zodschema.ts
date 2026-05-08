import { z } from 'zod/v4';

export const uuidSchema = z.uuid();
export type UUID = z.infer<typeof uuidSchema>;
