// app/auth/sso-callback/page.tsx
'use client';

import { useClerk, useSignIn, useSignUp } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { OVERVIEW } from '@/core/constants/routes.constants';

export default function SSOCallbackPage() {
	const clerk = useClerk();
	const { signIn } = useSignIn();
	const { signUp } = useSignUp();
	const router = useRouter();
	const hasRun = useRef(false);
	const [error, setError] = useState<string | null>(null);

	const navigateToLogin = useCallback(
		() => router.push('/auth/login'),
		[router]
	);

	const finalizeSession = useCallback(
		async (authObject: typeof signIn | typeof signUp) => {
			await authObject.finalize({
				navigate: () => router.push(OVERVIEW),
			});
		},
		[router]
	);

	useEffect(() => {
		const processCallback = async () => {
			if (!clerk.loaded || hasRun.current) return;
			// Prevent React Strict Mode double-invocation lifecycle loop
			hasRun.current = true;

			try {
				// 1. Terminal Sign-In State
				if (signIn.status === 'complete') {
					await finalizeSession(signIn);
					return;
				}

				// 2. Identity Transfer: Unverified Sign-Up to Existing Sign-In
				if (signUp.isTransferable) {
					await signIn.create({ transfer: true });
					await finalizeSession(signIn);
					return navigateToLogin();
				}

				// Evaluate requirement for manual primary factor submission
				if (
					signIn.status === 'needs_first_factor' &&
					!signIn.supportedFirstFactors?.every(
						(f) => f.strategy === 'enterprise_sso'
					)
				) {
					return navigateToLogin();
				}

				// 3. Identity Transfer: External Account to New Sign-Up Provisioning
				if (signIn.isTransferable) {
					await signUp.create({ transfer: true });
					if (signUp.status === 'complete') {
						await finalizeSession(signUp);
						return;
					}
					// Route to a designated form if required fields (e.g., terms acceptance) are missing
					return router.push('/auth/sign-up/continue');
				}

				// 4. Terminal Sign-Up State
				if (signUp.status === 'complete') {
					await finalizeSession(signUp);
					return;
				}

				// 5. Intercept for Multi-Factor Authentication or Credential Stuffing Mitigation
				if (
					signIn.status === 'needs_second_factor' ||
					signIn.status === 'needs_client_trust'
				) {
					return navigateToLogin();
				}

				// 6. Existing Active Session Resolution
				// Utilizes setActive as the session is already initialized outside of this direct cycle
				if (signIn.existingSession || signUp.existingSession) {
					const sessionId =
						signIn.existingSession?.sessionId ||
						signUp.existingSession?.sessionId;
					if (sessionId) {
						await clerk.setActive({
							session: sessionId,
							navigate: () => router.push(OVERVIEW),
						});
						return;
					}
				}
			} catch (err: unknown) {
				console.error('SSO Resolution Exception:', err);
				setError(
					'Identity payload invalid or expired. Please attempt authentication again.'
				);
			}
		};

		void processCallback();
	}, [clerk, signIn, signUp, router, finalizeSession, navigateToLogin]);

	if (error) {
		return <div className="text-destructive text-center py-8">{error}</div>;
	}

	return (
		<div className="full col-center gap-6">
			<div id="clerk-captcha" />

			<Loader2 className="animate-spin" />

			<p className="text-center text-base font-base text-content/70">
				Hang tight, we're setting you up...
			</p>
		</div>
	);
}
