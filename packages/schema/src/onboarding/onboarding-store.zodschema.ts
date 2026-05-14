import type { z } from 'zod/v4';
import {
	createStoreSchema,
	storeConfigureStepSchema,
	storeCreateStepSchema,
} from '../stores/create-store.zodschema';

export const onboardingStorePayloadSchema = createStoreSchema;

// Step 1
export const onboardingStoreCreateStep = storeCreateStepSchema;

// Step 2
export const onboardingStoreConfigStep = storeConfigureStepSchema;

export type OnboardingStorePayload = z.infer<
	typeof onboardingStorePayloadSchema
>;

// Currency options for select component
export const CURRENCY_OPTIONS: Array<{
	value: OnboardingStorePayload['currencyCode'];
	label: string;
}> = [
	{ value: 'USD', label: 'USD ($)' },
	{ value: 'EUR', label: 'EUR (€)' },
	{ value: 'INR', label: 'INR (₹)' },
	{ value: 'JPY', label: 'JPY (¥)' },
];
