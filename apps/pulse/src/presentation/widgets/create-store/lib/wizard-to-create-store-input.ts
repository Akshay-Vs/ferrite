/**
 * Builds a **`createStoreSchema` / `CreateStoreInput`** object from the two-step
 * wizard (step 1: `onboardingStoreCreateStep`, step 2: `onboardingStoreConfigStep`).
 *
 * Field names match the store API (`name`, `description`, `currencyCode`,
 * `storeIcon`); onboarding and `POST /stores` share the same contract via
 * `@ferrite/schema`.
 *
 * Trims strings and omits optional `description` / `storeIcon` when empty so
 * `createStoreSchema.safeParse` in the dialog configure hook matches backend
 * rules (including preprocess on `description` in `createStoreSchema`).
 */

import type { onboardingStoreConfigStep } from '@ferrite/schema';
import type { CreateStoreInput } from '@ferrite/schema/stores/create-store.zodschema';
import type { z } from 'zod/v4';
import type { CreateStoreFormValues } from '../hooks/use-create-store-form';

type ConfigureStepValues = z.infer<typeof onboardingStoreConfigStep>;

/**
 * @param step1 - Values from the name/description step (`onboardingStoreCreateStep`).
 * @param step2 - Values from the currency/icon step (`onboardingStoreConfigStep`).
 * @returns Payload for `createStoreSchema.safeParse` / `useCreateStore`.
 */
export function wizardToCreateStoreInput(
	step1: CreateStoreFormValues,
	step2: ConfigureStepValues
): CreateStoreInput {
	const name = step1.name.trim();
	const description =
		step1.description !== undefined && step1.description.trim() !== ''
			? step1.description.trim()
			: undefined;
	const currencyCode = step2.currencyCode;
	const storeIcon =
		step2.storeIcon !== undefined && step2.storeIcon.trim() !== ''
			? step2.storeIcon.trim()
			: undefined;

	const payload: CreateStoreInput = {
		name,
		currencyCode,
	};

	if (description !== undefined) {
		payload.description = description;
	}
	if (storeIcon !== undefined) {
		payload.storeIcon = storeIcon;
	}

	return payload;
}
