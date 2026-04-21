import { useSignIn } from '@clerk/nextjs';
import { useForm } from '@tanstack/react-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
	LOGIN_EMAIL_VERIFY,
	OVERVIEW,
} from '@/core/constants/routes.constrains';
import { resolveClerkError } from '@/core/utils/resolve-clerk-error';
import { loginSchema } from '../schemas/signin-form.zodschema';

export const useLoginForm = () => {
	const router = useRouter();
	const { signIn } = useSignIn();
	const [formError, setFormError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			email: '',
			password: '',
		},
		validators: {
			onChange: loginSchema,
		},
		onSubmit: async ({ value }) => {
			setFormError(null);

			// 1. Instantiate the authentication attempt
			const { error: createError } = await signIn.create({
				identifier: value.email,
			});

			if (createError) {
				setFormError(resolveClerkError(createError));
				return;
			}

			// 2. Submit cryptographic proof via the explicit Signal API
			const { error: passwordError } = await signIn.password({
				password: value.password,
			});

			if (passwordError) {
				setFormError(resolveClerkError(passwordError));
				return;
			}

			// 3. Evaluate operational status and route accordingly
			if (signIn.status === 'needs_first_factor') {
				const { error: sendError } = await signIn.emailCode.sendCode();
				if (sendError) {
					setFormError(resolveClerkError(sendError));
					return;
				}
				router.push(LOGIN_EMAIL_VERIFY);
				return;
			}

			if (
				signIn.status === 'needs_second_factor' ||
				signIn.status === 'needs_client_trust'
			) {
				const { error: mfaError } = await signIn.mfa.sendEmailCode();
				if (mfaError) {
					setFormError(resolveClerkError(mfaError));
					return;
				}
				router.push(LOGIN_EMAIL_VERIFY);
				return;
			}

			// 4. Finalize session realization upon complete status
			if (signIn.status === 'complete') {
				await signIn.finalize({
					navigate: () => router.push(OVERVIEW),
				});
			}
		},
	});

	return { form, formError };
};
