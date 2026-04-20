'use client';

import { useSignUp } from '@clerk/nextjs';
import { redirect, useRouter } from 'next/navigation';
import { OVERVIEW } from '@/core/constants/routes.constrains';
import GradientText from '@/presentation/primitives/gradient-text';
import { OTPForm } from '@/presentation/widgets/auth/forms/otp-form';

export default function VerifyEmailPage() {
	const { signUp, isLoaded, setActive } = useSignUp();
	const router = useRouter();

	const handleVerify = async ({ otp }: { otp: string }) => {
		if (!isLoaded || !signUp) return;

		const result = await signUp.attemptEmailAddressVerification({ code: otp });

		if (result.status === 'complete') {
			await setActive({ session: result.createdSessionId });
			router.push(OVERVIEW);
		} else {
			throw new Error('Verification incomplete. Please try again.');
		}
	};

	const handleResend = async () => {
		if (!isLoaded || !signUp) return;
		await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
	};

	if (isLoaded && !signUp.status) {
		redirect(OVERVIEW);
	}

	return (
		<div className="flex flex-col items-center gap-16 w-full">
			<div className="col-center gap-4">
				<h1 className="text-4xl font-extralight tracking-[0.012rem]">
					Verify your <GradientText text="Email" className="font-light" />
				</h1>
				<p className="text-lg font-light">
					We sent a 6-digit code to your email
				</p>
			</div>

			<OTPForm
				isReady={isLoaded}
				onFormSubmit={handleVerify}
				onResend={handleResend}
			/>
		</div>
	);
}
