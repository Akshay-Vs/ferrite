'use client';

import type { ReactNode } from 'react';
import { Button } from '@/presentation/primitives/button';
import { useOAuth } from '../hooks/use-oauth';

interface SSOProps {
	provider: 'oauth_facebook' | 'oauth_google' | 'oauth_microsoft';
	label: string;
	icon: ReactNode;
}

const SSO: React.FC<SSOProps> = ({ provider, label, icon }) => {
	const { isLoading, handleOAuthDelegation } = useOAuth();
	return (
		<Button
			className="h-14 w-14 hover:bg-active bg-surface text-content rounded-full center p-0"
			aria-label={label}
			onClick={() => handleOAuthDelegation(provider)}
			isLoading={isLoading}
		>
			<div className="scale-105">{icon}</div>
		</Button>
	);
};

export default SSO;
