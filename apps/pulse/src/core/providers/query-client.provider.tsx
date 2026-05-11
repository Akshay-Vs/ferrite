'use client';

import {
	QueryClient,
	QueryClientProvider as TanstackQueryClientProvider,
} from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000,
			},
		},
	});
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
	if (typeof window === 'undefined') {
		// Server: always make a new query client
		return makeQueryClient();
	} else {
		// Browser: make a new query client if we don't already have one
		if (!browserQueryClient) browserQueryClient = makeQueryClient();
		return browserQueryClient;
	}
}

const QueryClientProvider = ({ children }: PropsWithChildren) => {
	const queryClient = getQueryClient();

	return (
		<TanstackQueryClientProvider client={queryClient}>
			{children}
		</TanstackQueryClientProvider>
	);
};

export default QueryClientProvider;
