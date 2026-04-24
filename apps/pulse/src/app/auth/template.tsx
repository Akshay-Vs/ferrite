import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import { SALES_OVERVIEW } from '@/core/constants/routes.constants';
import FadeInContainer from '@/presentation/animations/fade-in-container';
import { Card, CardContent, CardHeader } from '@/presentation/primitives/card';
import { Logo } from '@/presentation/primitives/logo';

const layout = async ({ children }: PropsWithChildren) => {
	const { isAuthenticated } = await auth();

	if (isAuthenticated) {
		return redirect(SALES_OVERVIEW);
	}

	return (
		<main className="w-full flex-1 center py-5">
			<FadeInContainer>
				<Card className="w-130 h-full bg-transparent border-transparent ring-transparent shadow-transparent rounded-none ring-0 p-0 center gap-12">
					<CardHeader className="center rounded-t-none">
						<Logo size="3xl" strokeWidth={1.25} />
					</CardHeader>

					<CardContent>{children}</CardContent>
				</Card>
			</FadeInContainer>
		</main>
	);
};

export default layout;
