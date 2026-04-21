import { useForm } from '@tanstack/react-form';
import { useRouter } from 'nextjs-toploader/app';
import { useState } from 'react';
import { ONBOARDING_CREATE_STORE } from '@/core/constants/routes.constrains';
import {
	type OnboardingUser,
	onboardingUserSchema,
} from '../schemas/onboarding-user.zodschema';

export const useOnboardingUser = () => {
	const [formError, setFormError] = useState<string | null>(null);
	const router = useRouter();

	const defaultValues: OnboardingUser = {
		fullName: '',
		userProfession: undefined,
		referralSource: undefined,
	};
	const form = useForm({
		defaultValues,
		validators: {
			onChange: onboardingUserSchema,
		},
		onSubmit: async () => {
			setFormError(null);

			router.push(ONBOARDING_CREATE_STORE);
		},
	});

	return { form, formError };
};
