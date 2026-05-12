'use client';
import { useAuth } from '@clerk/nextjs';
import { FerriteProvider } from '@ferrite/react';
import { type PropsWithChildren, useCallback } from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_FERRITE_API_URL;
if (!BASE_URL) {
	throw new Error('NEXT_PUBLIC_FERRITE_API_URL is not defined');
}

const FerriteCoreProvider = ({ children }: PropsWithChildren) => {
	const { getToken } = useAuth();
	const getTokenCallback = useCallback(() => getToken(), [getToken]);

	return (
		<FerriteProvider
			baseURL={BASE_URL}
			getToken={getTokenCallback}
			version="v1"
		>
			{children}
		</FerriteProvider>
	);
};

export default FerriteCoreProvider;
