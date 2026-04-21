import { useForm } from '@tanstack/react-form';
import { useRouter } from 'nextjs-toploader/app';
import { ONBOARDING_CONFIGURE_STORE } from '@/core/constants/routes.constrains';
import { storeCreateSchema } from '../schemas/onboarding-store.zodschema';
import { useStoreCreationStore } from '../stores/onboarding.store';

export const useOnboardingCreateStore = () => {
	const router = useRouter();
	const { data, updateData } = useStoreCreationStore();

	const form = useForm({
		defaultValues: {
			storeName: data.storeName ?? '',
			storeDescription: data.storeDescription ?? '',
		},
		validators: {
			onSubmit: storeCreateSchema,
		},
		onSubmit: async ({ value }) => {
			updateData(value);
			router.push(ONBOARDING_CONFIGURE_STORE);
		},
	});

	return { form };
};
