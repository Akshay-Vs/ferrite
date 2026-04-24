'use client';

import { useSignIn } from '@clerk/nextjs';
import type { OAuthStrategy } from '@clerk/shared/types';
import { useState } from 'react';
import {
	SALES_OVERVIEW,
	SSO_CALLBACK,
} from '@/core/constants/routes.constants';
import { resolveClerkError } from '@/core/utils/resolve-clerk-error';

export const useOAuth = () => {
	const { signIn } = useSignIn();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleOAuthDelegation = async (strategy: OAuthStrategy) => {
		if (!signIn) return;

		await signIn.reset();
		setError(null);
		setIsLoading(true);

		try {
			const origin =
				typeof window !== 'undefined' ? window.location.origin : '';
			const absoluteCallbackUrl = `${origin}${SSO_CALLBACK}`;
			const absoluteRedirectUrl = `${origin}${SALES_OVERVIEW}`;

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
