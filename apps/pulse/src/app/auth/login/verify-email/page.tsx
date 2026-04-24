'use client';

import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type z from 'zod/v4';
import { SALES_OVERVIEW } from '@/core/constants/routes.constants';
import FormHeading from '@/presentation/primitives/form-heading';
import { OTPForm } from '@/presentation/widgets/auth/forms/otp-form';
import type { otpFormSchema } from '@/presentation/widgets/auth/schemas/otp-form.zodschema';

const VerificationPage = () => {
	const { signIn } = useSignIn();
	const router = useRouter();

	useEffect(() => {
		// Client-side intercept: Ensure an active authentication cycle exists
		if (!signIn?.status) {
			router.replace(SALES_OVERVIEW);
		}
	}, [signIn?.status, router]);

	const onSubmit = async (
		values: z.infer<typeof otpFormSchema>
	): Promise<{ error?: unknown } | undefined> => {
		if (!signIn) return;

		let errorResult: unknown;

		// 1. Primary verification logic
		if (signIn.status === 'needs_first_factor') {
			const { error } = await signIn.emailCode.verifyCode({
				code: values.otp,
			});
			errorResult = error;
		}
		// 2. Secondary MFA / Security mitigation logic
		else if (
			signIn.status === 'needs_second_factor' ||
			signIn.status === 'needs_client_trust'
		) {
			const { error } = await signIn.mfa.verifyEmailCode({
				code: values.otp,
			});
			errorResult = error;
		}

		if (errorResult) {
			return { error: errorResult };
		}

		// 3. Finalize execution state upon successful cryptographic proof
		if (signIn.status === 'complete') {
			await signIn.finalize({
				navigate: () => router.push(SALES_OVERVIEW),
			});
		}
	};

	const onResend = async (): Promise<{ error?: unknown } | undefined> => {
		if (!signIn) return;

		// The explicit extraction of emailAddressId is bypassed entirely
		if (signIn.status === 'needs_first_factor') {
			const { error } = await signIn.emailCode.sendCode();
			if (error) return { error };
		} else if (
			signIn.status === 'needs_second_factor' ||
			signIn.status === 'needs_client_trust'
		) {
			const { error } = await signIn.mfa.sendEmailCode();
			if (error) return { error };
		}
	};

	// Prevent pre-render visual jitter prior to potential redirect evaluation
	if (!signIn?.status) {
		return null;
	}

	return (
		<div className="flex flex-col items-center gap-16 w-full">
			<FormHeading
				title="Verify your"
				highlightedText="Email"
				description="We sent a 6-digit code to your email"
			/>
			<OTPForm onFormSubmit={onSubmit} onResend={onResend} />
		</div>
	);
};

export default VerificationPage;
