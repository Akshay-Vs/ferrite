'use client';

import { useSignIn } from '@clerk/nextjs';
import type { SignInResource } from '@clerk/types';
import { redirect } from 'next/navigation';
import type z from 'zod/v4';
import { OVERVIEW } from '@/core/constants/routes.constrains';
import { OTPForm } from '@/presentation/widgets/auth/forms/otp-form';
import type { otpFormSchema } from '@/presentation/widgets/auth/schemas/otp-form.zodschema';

const VerificationPage = () => {
	const { isLoaded, setActive, signIn: login } = useSignIn();

	const onSubmit = async (
		values: z.infer<typeof otpFormSchema>
	): Promise<void> => {
		if (!isLoaded) return;

		let result: SignInResource | undefined;

		if (login.status === 'needs_first_factor') {
			result = await login.attemptFirstFactor({
				strategy: 'email_code',
				code: values.otp,
			});
		} else if (login.status === 'needs_second_factor') {
			result = await login.attemptSecondFactor({
				strategy: 'email_code',
				code: values.otp,
			});
		}

		if (result?.status === 'complete') {
			await setActive({ session: login.createdSessionId });
		}
	};

	const onResend = async () => {
		if (!isLoaded || !login.identifier) return;
		if (login.status === 'needs_first_factor') {
			const emailCodeFactor = login.supportedFirstFactors?.find(
				(factor) => factor.strategy === 'email_code'
			);

			if (emailCodeFactor) {
				await login.prepareFirstFactor({
					strategy: 'email_code',
					emailAddressId: emailCodeFactor.emailAddressId,
				});
			}
		} else if (login.status === 'needs_second_factor') {
			const emailCodeFactor = login.supportedSecondFactors?.find(
				(factor) => factor.strategy === 'email_code'
			);

			if (emailCodeFactor) {
				await login.prepareSecondFactor({
					strategy: 'email_code',
					emailAddressId: emailCodeFactor.emailAddressId,
				});
			}
		}
	};

	if (isLoaded && !login.status) {
		redirect(OVERVIEW);
	}

	return (
		<OTPForm isReady={isLoaded} onFormSubmit={onSubmit} onResend={onResend} />
	);
};

export default VerificationPage;
