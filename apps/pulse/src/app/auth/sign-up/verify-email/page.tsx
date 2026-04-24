'use client';

import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SALES_OVERVIEW } from '@/core/constants/routes.constants';
import FormHeading from '@/presentation/primitives/form-heading';
import { OTPForm } from '@/presentation/widgets/auth/forms/otp-form';

export default function VerifyEmailPage() {
	const { signUp } = useSignUp();
	const router = useRouter();

	useEffect(() => {
		// Client-side intercept: Enforce the presence of an active sign-up cycle
		if (!signUp?.status) {
			router.replace(SALES_OVERVIEW);
		}
	}, [signUp?.status, router]);

	const handleVerify = async ({
		otp,
	}: {
		otp: string;
	}): Promise<{ error?: unknown } | undefined> => {
		if (!signUp) return;

		// 1. Submit the cryptographic proof
		const { error } = await signUp.verifications.verifyEmailCode({ code: otp });

		if (error) {
			// Return the deterministic error payload directly to the OTP form controller
			return { error };
		}

		// 2. Finalize session realization upon complete status
		if (signUp.status === 'complete') {
			await signUp.finalize({
				navigate: () => router.push(SALES_OVERVIEW),
			});
		}
	};

	const handleResend = async (): Promise<{ error?: unknown } | undefined> => {
		if (!signUp) return;

		// Re-dispatch the verification challenge
		const { error } = await signUp.verifications.sendEmailCode();

		if (error) {
			return { error };
		}
	};

	// Prevent pre-render visual jitter prior to state evaluation and interception
	if (!signUp?.status) {
		return null;
	}

	return (
		<div className="flex flex-col items-center gap-16 w-full">
			<FormHeading
				title="Verify your"
				highlightedText="Email"
				description="We sent a 6-digit code to your email"
			/>

			<OTPForm onFormSubmit={handleVerify} onResend={handleResend} />
		</div>
	);
}
