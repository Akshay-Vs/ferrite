import { useForm } from '@tanstack/react-form';
import { useRouter } from 'nextjs-toploader/app';
import { useState } from 'react';
import {
	ONBOARDING_CONNECT_STORE,
	ONBOARDING_CREATE_STORE,
} from '@/core/constants/routes.constants';
import {
	onboardingStoreCreateSchema,
	storeConfigureSchema,
} from '../schemas/onboarding-store.zodschema';
import { useStoreCreationStore } from '../stores/onboarding.store';

export const useOnboardingStoreConfigure = () => {
	const router = useRouter();
	const { data, clearSession } = useStoreCreationStore();
	const [isSubmittingToAPI, setIsSubmittingToAPI] = useState(false);

	const form = useForm({
		defaultValues: {
			storeCurrency: 'USD',
			StoreIcon: data.StoreIcon ?? '',
		},
		validators: {
			onSubmit: storeConfigureSchema,
		},
		onSubmit: async ({ value }) => {
			setIsSubmittingToAPI(true);

			// 1. Synthesize final payload from both session data and current form value
			const rawPayload = { ...data, ...value };

			// 2. Execute a strict validation against the master schema
			const parseResult = onboardingStoreCreateSchema.safeParse(rawPayload);

			if (!parseResult.success) {
				// Critical anomaly: Step 1 data is missing or corrupted
				console.error('Payload validation failed', parseResult.error);
				router.push(ONBOARDING_CREATE_STORE);
				return;
			}

			const finalPayload = parseResult.data;

			try {
				// 3. Dispatch to API
				// await api.stores.create(finalPayload);

				// 4. Terminate session and redirect upon success
				clearSession();
				router.push(ONBOARDING_CONNECT_STORE);
			} catch (error) {
				console.error('API Error', error);
			} finally {
				setIsSubmittingToAPI(false);
			}
		},
	});

	return { form, isSubmittingToAPI };
};
