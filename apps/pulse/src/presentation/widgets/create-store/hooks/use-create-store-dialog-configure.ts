'use client';

import { queryKeys, useCreateStore } from '@ferrite/react';
import { onboardingStoreConfigStep } from '@ferrite/schema';
import { createStoreSchema } from '@ferrite/schema/stores/create-store.zodschema';
import type { GetStore } from '@ferrite/schema/stores/get-store.zodschema';
import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { setSelectedStore } from '@/application/store/selected-store.store';
import { toast } from '@/presentation/primitives/sonner';
import { wizardToCreateStoreInput } from '../lib/wizard-to-create-store-input';
import type { CreateStoreFormValues } from './use-create-store-form';

export type UseCreateStoreDialogConfigureOptions = {
	step1: CreateStoreFormValues;
	onCompleted: () => void;
	/** Combined payload fails `createStoreSchema` (e.g. validation). */
	onInvalidPayload: () => void;
};

export function useCreateStoreDialogConfigure({
	step1,
	onCompleted,
	onInvalidPayload,
}: UseCreateStoreDialogConfigureOptions) {
	const queryClient = useQueryClient();

	const { mutate, isPending } = useCreateStore({
		onSuccess: (store: GetStore) => {
			setSelectedStore(store.id, store.name);
			void queryClient.invalidateQueries({
				queryKey: queryKeys.stores.all.queryKey,
			});
			void queryClient.invalidateQueries({
				queryKey: queryKeys.stores.detail(store.id).queryKey,
			});
			toast.success('Store created', {
				description: 'Switched to your new store.',
			});
			onCompleted();
		},
		onError: (error: Error) => {
			console.error('Create store API error', error);
			toast.error('Failed to create store', {
				description: 'Please try again.',
			});
		},
	});

	const form = useForm({
		defaultValues: {
			currencyCode: 'USD',
			storeIcon: 'Store',
		},
		validators: {
			onChange: onboardingStoreConfigStep,
		},
		onSubmit: async ({ value }) => {
			const candidate = wizardToCreateStoreInput(step1, value);
			const parsed = createStoreSchema.safeParse(candidate);
			if (!parsed.success) {
				toast.error('Invalid store details', {
					description:
						parsed.error.issues[0]?.message ??
						'Check name and description and try again.',
				});
				onInvalidPayload();
				return;
			}
			mutate(parsed.data);
		},
	});

	return { form, isPending };
}

export type CreateStoreDialogConfigureFormApi = ReturnType<
	typeof useCreateStoreDialogConfigure
>['form'];
