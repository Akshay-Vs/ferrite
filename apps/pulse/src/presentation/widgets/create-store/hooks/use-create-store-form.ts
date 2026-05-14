'use client';

import { onboardingStoreCreateStep } from '@ferrite/schema';
import { useForm } from '@tanstack/react-form';
import type { z } from 'zod/v4';

export type CreateStoreFormValues = z.infer<typeof onboardingStoreCreateStep>;

export type UseCreateStoreFormOptions = {
	defaultValues: CreateStoreFormValues;
	onSubmit: (value: CreateStoreFormValues) => void | Promise<void>;
};

export function useCreateStoreForm({
	defaultValues,
	onSubmit,
}: UseCreateStoreFormOptions) {
	return useForm({
		defaultValues,
		validators: {
			onSubmit: onboardingStoreCreateStep,
		},
		onSubmit: async ({ value }) => {
			await onSubmit(value);
		},
	});
}

export type CreateStoreFormApi = ReturnType<typeof useCreateStoreForm>;
