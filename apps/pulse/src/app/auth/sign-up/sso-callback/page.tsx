'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { OVERVIEW } from '@/core/constants/routes.constrains';

export default function Page() {
	const router = useRouter();

	useEffect(() => {
		const t = setTimeout(() => {
			router.push(OVERVIEW);
		}, 8000);

		return () => clearTimeout(t);
	}, [router.push]);

	return (
		<div className="full col-center gap-6">
			<div id="clerk-captcha" />
			<AuthenticateWithRedirectCallback />

			<Loader2 className="animate-spin" />

			<p className="text-center text-base font-base text-content/70">
				We are setting up your account...
			</p>
		</div>
	);
}
