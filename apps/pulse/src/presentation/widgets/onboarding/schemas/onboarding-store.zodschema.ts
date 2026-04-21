import { z } from 'zod/v4';

export const onboardingStoreCreateSchema = z.object({
	// Step 1
	storeName: z.string().min(1, { message: 'Store name is required' }).max(64),
	storeDescription: z
		.string()
		.min(1, { message: 'Store description is required' })
		.max(255),

	// Step 2
	storeCurrency: z.enum(['USD', 'INR', 'EUR', 'JPY']),
	storeIcon: z
		.string()
		.min(1, {
			message: 'Select an icon for your store, search for more icons',
		})
		.max(24),
});

// Extracted sub-schemas for localized form validation

// Step 1
export const storeCreateSchema = onboardingStoreCreateSchema.pick({
	storeName: true,
	storeDescription: true,
});

// Step 2
export const storeConfigureSchema = onboardingStoreCreateSchema.pick({
	storeCurrency: true,
	StoreIcon: true,
});

export type OnboardingStoreCreate = z.infer<typeof onboardingStoreCreateSchema>;

export const CURRENCY_OPTIONS: Array<{
	value: OnboardingStoreCreate['storeCurrency'];
	label: string;
}> = [
	{ value: 'USD', label: 'USD ($)' },
	{ value: 'EUR', label: 'EUR (€)' },
	{ value: 'INR', label: 'INR (₹)' },
	{ value: 'JPY', label: 'JPY (¥)' },
];
