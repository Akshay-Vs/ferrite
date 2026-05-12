import { useOnboardStore } from '@ferrite/react';
import {
	onboardingStoreCreateSchema,
	storeConfigureSchema,
} from '@ferrite/schema';
import { useForm } from '@tanstack/react-form';
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
	const { onboardingStore } = useOnboardingStore();

	const { mutate: onboardStore, isPending } = useOnboardStore({
		onSuccess: () => {
			clearOnboardingStore();
			router.push(ONBOARDING_CONNECT_STORE);

			toast.success('Welcome aboard!', {
				description: "You're all set to start building your first store!",
				action: {
					label: 'View Documentation',
					onClick: () => window.open(DOCS_HOME, '_blank'),
				},
			});
		},
	});

	const form = useForm({
		defaultValues: {
			storeCurrency: onboardingStore.storeCurrency ?? 'USD',
			storeIcon: onboardingStore.storeIcon ?? 'Store',
		},
		validators: {
			onChange: storeConfigureSchema,
		},
		onSubmit: async ({ value }) => {
			// Synthesize final payload from both session data and current form value
			const rawPayload = { ...onboardingStore, ...value };

			// Execute a strict validation against the master schema
			const parseResult = onboardingStoreCreateSchema.safeParse(rawPayload);

			if (!parseResult.success) {
				// Critical anomaly: Step 1 data is missing or corrupted
				toast.error('Missing required fields', {
					description:
						'Step 1 of the onboarding process is missing required fields',
				});
				router.push(ONBOARDING_CREATE_STORE);

				return;
			}

			const finalPayload = parseResult.data;

			try {
				// Dispatch to API
				onboardStore(finalPayload);

				// Clear session and redirect upon success
				clearOnboardingStore();
				router.push(ONBOARDING_CONNECT_STORE);
			} catch (error) {
				console.error('API Error', error);
				toast.error('Failed to create store', {
					description: 'Failed to create store. Please try again.',
				});
			}
		},
	});

	return { form, isPending };
};
