import { useSignIn } from '@clerk/nextjs';
import { useForm } from '@tanstack/react-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { OVERVIEW, VERIFY_EMAIL } from '@/core/constants/routes.constrains';
import { resolveClerkError } from '@/core/utils/resolve-clerk-error';
import { loginSchema } from '../schemas/signin-form.zodschema';

export const useLoginForm = () => {
	const router = useRouter();
	const { signIn, isLoaded, setActive } = useSignIn();
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
			if (!isLoaded || !signIn) {
				return;
			}

			setFormError(null);

			try {
				const result = await signIn.create({
					identifier: value.email,
					password: value.password,
				});

				// Handle first factor needed (email verification before password)
				if (result.status === 'needs_first_factor') {
					const emailCodeFactor = result.supportedFirstFactors?.find(
						(factor) => factor.strategy === 'email_code'
					);

					if (emailCodeFactor) {
						await signIn.prepareFirstFactor({
							strategy: 'email_code',
							emailAddressId: emailCodeFactor.emailAddressId,
						});

						router.push(VERIFY_EMAIL);
					}
				}

				// Handle second factor needed (2FA after password)
				if (result.status === 'needs_second_factor') {
					const emailCodeFactor = result.supportedSecondFactors?.find(
						(factor) => factor.strategy === 'email_code'
					);

					if (emailCodeFactor) {
						await signIn.prepareSecondFactor({
							strategy: 'email_code',
							emailAddressId: emailCodeFactor.emailAddressId,
						});

						router.push(VERIFY_EMAIL);
					}
				}

				if (result.status === 'complete') {
					await setActive({ session: result.createdSessionId });
					router.push(OVERVIEW);
				}
			} catch (error: unknown) {
				setFormError(resolveClerkError(error));
			}
		},
	});

	return { form, formError };
};
