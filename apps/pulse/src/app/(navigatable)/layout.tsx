import { redirect } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import {
	ONBOARDING_ABOUT_USER,
	ONBOARDING_CREATE_STORE,
} from '@/core/constants/routes.constants';
import { resolveOnboardingState } from '@/core/server/onboarding-ressolver';
import { NavBar } from '@/presentation/layout/navigation/nav-bar';
import { SheetRouter } from '@/presentation/sheet-router/sheet-router';

const ONBOARDING_REDIRECT_MAP = {
	ABOUT_ME: ONBOARDING_ABOUT_USER,
	STORE_CREATION: ONBOARDING_CREATE_STORE,
} as const;

export default async function NavigatableLayout({
	children,
}: PropsWithChildren) {
	const state = await resolveOnboardingState();

	if (state !== 'COMPLETED') {
		// Redirect to the appropriate step or fallback to the initial step
		const target =
			ONBOARDING_REDIRECT_MAP[state as keyof typeof ONBOARDING_REDIRECT_MAP] ??
			ONBOARDING_ABOUT_USER;
		redirect(target);
	}

	return (
		<div className="pb-4">
			<NavBar />
			<main className="px-5">{children}</main>
			<SheetRouter />
		</div>
	);
}
