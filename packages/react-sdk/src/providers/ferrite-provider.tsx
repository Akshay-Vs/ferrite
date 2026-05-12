import { FerriteClient } from '@ferrite/api';
import type React from 'react';
import { createContext, useContext, useMemo } from 'react';

// We export the configured API client so hooks can consume it
export interface FerriteContextValue {
	client: FerriteClient;
}

const FerriteContext = createContext<FerriteContextValue | null>(null);

export interface FerriteProviderProps {
	children: React.ReactNode;
	baseURL: string;
	/** Optional specific version override (defaults to 'v1' inside the client) */
	version?: string;
	/** Asynchronous token getter (ie: Clerk's useAuth) */
	getToken: () => Promise<string | null>;
}

/**
 * FerriteProvider
 *
 * Wraps your application to provide an instantiated Ferrite API Client.
 * Note: You must place this *inside* your ClerkProvider and TanStack QueryProvider.
 */
export const FerriteProvider: React.FC<FerriteProviderProps> = ({
	children,
	baseURL,
	version,
	getToken,
}) => {
	// Memoize the client so we don't recreate Axios instances unnecessarily
	const client = useMemo(
		() =>
			new FerriteClient({
				baseURL,
				version,
				getToken,
			}),
		[baseURL, version, getToken]
	);

	return (
		<FerriteContext.Provider value={{ client }}>
			{children}
		</FerriteContext.Provider>
	);
};

/**
 * Hook to access the raw Ferrite API Client.
 * Mostly used internally by the SDK hooks.
 */
export const useFerriteClient = (): FerriteClient => {
	const context = useContext(FerriteContext);
	if (!context) {
		throw new Error(
			'useFerriteClient must be used within a <FerriteProvider>.'
		);
	}
	return context.client;
};
