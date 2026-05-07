import {
	type OnboardingAboutUser,
	onboardingAboutUserSchema,
} from '@ferrite/schema';
import { useForm } from '@tanstack/react-form';
import { useRouter } from 'nextjs-toploader/app';
import { useState } from 'react';
import { ONBOARDING_CREATE_STORE } from '@/core/constants/routes.constants';

export const useOnboardingUser = () => {
	const [formError, setFormError] = useState<string | null>(null);
	const router = useRouter();

	const defaultValues: OnboardingAboutUser = {
		firstName: '',
		lastName: '',
		userProfession: undefined,
		referralSource: undefined,
	};
	const form = useForm({
		defaultValues,
		validators: {
			onChange: onboardingAboutUserSchema,
		},
		onSubmit: async () => {
			setFormError(null);

			router.push(ONBOARDING_CREATE_STORE);
		},
	});

	return { form, formError };
};
