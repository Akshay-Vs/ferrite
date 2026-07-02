import { z } from 'zod';

export const StoreConfigSchema = z.object({
	storeId: z.uuid(),
	frontendUrl: z.url().max(255).nullable(),
	htmlTemplate: z.string().max(255).nullable(),
	updatedAt: z.date(),
});

export type StoreConfig = z.infer<typeof StoreConfigSchema>;

export const UpdateStoreConfigSchema = z.object({
	frontendUrl: z.string().url().max(255).nullable().optional(),
	htmlTemplate: z.string().max(255).nullable().optional(),
});

export type UpdateStoreConfigInput = z.infer<typeof UpdateStoreConfigSchema>;
