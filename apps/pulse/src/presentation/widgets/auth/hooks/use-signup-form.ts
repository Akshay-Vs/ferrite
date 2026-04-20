import { useSignUp } from '@clerk/nextjs';
import { useForm } from '@tanstack/react-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SIGNUP_VERIFY_EMAIL } from '@/core/constants/routes.constrains';
import { resolveClerkError } from '@/core/utils/resolve-clerk-error';
import { signupSchema } from '../schemas/login-form.zodschema';

export const useSignUpForm = () => {
	const router = useRouter();
	const { signUp, isLoaded } = useSignUp();
	const [formError, setFormError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			email: '',
			password: '',
			confirmPassword: '',
		},
		validators: {
			onChange: signupSchema,
		},
		onSubmit: async ({ value }) => {
			if (!isLoaded || !signUp) {
				return;
			}

			setFormError(null);

			try {
				await signUp.create({
					emailAddress: value.email,
					password: value.password,
				});

				await signUp.prepareEmailAddressVerification({
					strategy: 'email_code',
				});

				router.push(SIGNUP_VERIFY_EMAIL);
			} catch (error: unknown) {
				setFormError(resolveClerkError(error));
			}
		},
	});

	return { form, formError };
};
