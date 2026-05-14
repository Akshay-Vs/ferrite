import { useRouter } from 'nextjs-toploader/app';
import { ONBOARDING_CONFIGURE_STORE } from '@/core/constants/routes.constants';
import { useCreateStoreForm } from '@/presentation/widgets/create-store/hooks/use-create-store-form';
import {
	updateOnboardingStore,
	useOnboardingStore,
} from '../stores/onboarding.store';

export const useOnboardingCreateStore = () => {
	const router = useRouter();
	const { onboardingStore } = useOnboardingStore();

	const form = useCreateStoreForm({
		defaultValues: {
			name: onboardingStore.name ?? '',
			description: onboardingStore.description,
		},
		onSubmit: async (value) => {
			updateOnboardingStore(value);
			router.push(ONBOARDING_CONFIGURE_STORE);
		},
	});

	return { form };
};
