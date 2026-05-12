import { storeCreateSchema } from '@ferrite/schema';
import { useForm } from '@tanstack/react-form';
import { useRouter } from 'nextjs-toploader/app';
import { ONBOARDING_CONFIGURE_STORE } from '@/core/constants/routes.constants';
import {
	updateOnboardingStore,
	useOnboardingStore,
} from '../stores/onboarding.store';

export const useOnboardingCreateStore = () => {
	const router = useRouter();
	const { onboardingStore } = useOnboardingStore();

	const form = useForm({
		defaultValues: {
			storeName: onboardingStore.storeName ?? '',
			storeDescription: onboardingStore.storeDescription ?? '',
		},
		validators: {
			onSubmit: storeCreateSchema,
		},
		onSubmit: async ({ value }) => {
			updateOnboardingStore(value);
			router.push(ONBOARDING_CONFIGURE_STORE);
		},
	});

	return { form };
};
