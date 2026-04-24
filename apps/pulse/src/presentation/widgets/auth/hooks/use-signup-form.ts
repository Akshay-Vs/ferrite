import { useSignUp } from '@clerk/nextjs';
import { useForm } from '@tanstack/react-form';
import { useRouter } from 'nextjs-toploader/app';
import { useState } from 'react';
import { SIGNUP_EMAIL_VERIFY } from '@/core/constants/routes.constants';
import { resolveClerkError } from '@/core/utils/resolve-clerk-error';
import { signupSchema } from '../schemas/signup-form.zodschema';

export const useSignUpForm = () => {
	const router = useRouter();
	const { signUp } = useSignUp();
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
			setFormError(null);

			// 1. Instantiate the sign-up entity with credentials
			const { error: createError } = await signUp.create({
				emailAddress: value.email,
				password: value.password,
			});

			if (createError) {
				setFormError(resolveClerkError(createError));
				return;
			}

			// 2. Dispatch the cryptographic verification challenge
			const { error: sendError } = await signUp.verifications.sendEmailCode();

			if (sendError) {
				setFormError(resolveClerkError(sendError));
				return;
			}

			// 3. Route client to the OTP validation view
			router.push(SIGNUP_EMAIL_VERIFY);
		},
	});

	return { form, formError };
};
