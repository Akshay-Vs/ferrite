'use client';

import { useSignIn } from '@clerk/nextjs';
import type { OAuthStrategy } from '@clerk/types';
import { useState } from 'react';
import { OVERVIEW, SSO_CALLBACK } from '@/core/constants/routes.constrains';
import { resolveClerkError } from '@/core/utils/resolve-clerk-error';

export const useOAuth = () => {
	const { signIn } = useSignIn();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleOAuthDelegation = async (strategy: OAuthStrategy) => {
		if (!signIn) return;

		setError(null);
		setIsLoading(true);

		try {
			// Evaluate if the state machine is contaminated with an aborted attempt.
			// If the status is anything other than null, an old cache exists.
			if (signIn.status !== null) {
				console.log(`[OAuth] Purging aborted state: ${signIn.status}`);
				// Synchronously destroy the hanging attempt to ensure a clean slate
				signIn.reset();
			}

			console.log(`[OAuth] Initiating fresh handshake for: ${strategy}`);

			const origin =
				typeof window !== 'undefined' ? window.location.origin : '';
			const absoluteCallbackUrl = `${origin}${SSO_CALLBACK}`;
			const absoluteRedirectUrl = `${origin}${OVERVIEW}`;

			const { error: clerkError } = await signIn.sso({
				strategy,
				redirectCallbackUrl: absoluteCallbackUrl,
				redirectUrl: absoluteRedirectUrl,
			});

			if (clerkError) {
				console.error('[OAuth] Handshake explicit failure:', clerkError);
				setError(resolveClerkError(clerkError));
				setIsLoading(false);
			} else {
				console.log(
					'[OAuth] Handshake constructed, awaiting browser redirect...'
				);
			}
		} catch (err: unknown) {
			console.error('[OAuth] Fatal execution exception:', err);
			setError('Authentication initiation failed. Please try again.');
			setIsLoading(false);
		}
	};

	return {
		handleOAuthDelegation,
		isLoading,
		error,
	};
};
