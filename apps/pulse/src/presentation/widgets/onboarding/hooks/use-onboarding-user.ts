import { useOnboardUser } from '@ferrite/react';
import {
	type OnboardingAboutUser,
	onboardingAboutUserSchema,
} from '@ferrite/schema/onboarding/onboarding-user.zodschema';
import { useForm } from '@tanstack/react-form';
import { useRouter } from 'nextjs-toploader/app';
import { useState } from 'react';
import { z } from 'zod/v4';
import { ONBOARDING_CREATE_STORE } from '@/core/constants/routes.constants';

const formSchema = onboardingAboutUserSchema
	.omit({ firstName: true, lastName: true })
	.extend({
		fullName: z
			.string()
			.min(1, { message: 'Full name is required' })
			.refine(
				(val) => val.trim().split(/\s+/).length >= 2,
				'Please enter your first and last name'
			),
	});

type OnboardingAboutUserForm = z.infer<typeof formSchema>;

export const useOnboardingUser = () => {
	const [formError, setFormError] = useState<string | null>(null);
	const router = useRouter();
	const { mutateAsync, isPending } = useOnboardUser();

	const defaultValues: OnboardingAboutUserForm = {
		fullName: '',
		userProfession: undefined,
		referralSource: undefined,
	};
	const form = useForm({
		defaultValues,
		validators: {
			onChange: formSchema,
		},
		onSubmit: async ({ value }) => {
			setFormError(null);

			const nameParts = value.fullName.trim().split(/\s+/);
			const firstName = nameParts[0] ?? '';
			const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

			const payload: OnboardingAboutUser = {
				firstName,
				lastName,
				userProfession: value.userProfession,
				referralSource: value.referralSource,
			};

			try {
				await mutateAsync(payload);
				router.push(ONBOARDING_CREATE_STORE);
			} catch (err: any) {
				setFormError(err.message || 'Something went wrong');
			}
		},
	});

	return { form, formError, isPending };
};
