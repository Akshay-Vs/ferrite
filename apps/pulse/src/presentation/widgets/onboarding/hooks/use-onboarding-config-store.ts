import { queryKeys, useOnboardStore } from '@ferrite/react';
import {
	onboardingStoreConfigStep,
	onboardingStorePayloadSchema,
} from '@ferrite/schema';
import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'nextjs-toploader/app';
import { DOCS_HOME } from '@/core/constants/resource-url.constants';
import {
	ONBOARDING_CONNECT_STORE,
	ONBOARDING_CREATE_STORE,
} from '@/core/constants/routes.constants';
import { toast } from '@/presentation/primitives/sonner';
import {
	clearOnboardingStore,
	useOnboardingStore,
} from '../stores/onboarding.store';

export const useOnboardingStoreConfigure = () => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { onboardingStore } = useOnboardingStore();

	const { mutate: onboardStore, isPending } = useOnboardStore({
		onSuccess: () => {
			clearOnboardingStore();
			void queryClient.invalidateQueries({
				queryKey: queryKeys.stores.all.queryKey,
			});
			void queryClient.invalidateQueries({
				queryKey: queryKeys.onboarding.session.queryKey,
			});
			router.push(ONBOARDING_CONNECT_STORE);
			toast.success('Welcome aboard!', {
				description: "You're all set to start building your first store!",
				action: {
					label: 'View Documentation',
					onClick: () => window.open(DOCS_HOME, '_blank'),
				},
			});
		},
		onError: (error: Error) => {
			console.error('Onboard store API error', error);
			toast.error('Failed to create store', {
				description: 'Failed to create store. Please try again.',
			});
		},
	});

	const form = useForm({
		defaultValues: {
			currencyCode: onboardingStore.currencyCode ?? 'USD',
			storeIcon: onboardingStore.storeIcon ?? 'Store',
		},
		validators: {
			onChange: onboardingStoreConfigStep,
		},
		onSubmit: async ({ value }) => {
			const rawPayload = { ...onboardingStore, ...value };
			const parseResult = onboardingStorePayloadSchema.safeParse(rawPayload);

			if (!parseResult.success) {
				toast.error('Missing required fields', {
					description:
						'Step 1 of the onboarding process is missing required fields',
				});
				router.push(ONBOARDING_CREATE_STORE);
				return;
			}

			onboardStore(parseResult.data);
		},
	});

	return { form, isPending };
};

export type OnboardingConfigureFormApi = ReturnType<
	typeof useOnboardingStoreConfigure
>['form'];
