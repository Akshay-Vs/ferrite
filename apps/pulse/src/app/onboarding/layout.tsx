import type { PropsWithChildren } from 'react';
import { Card, CardContent, CardHeader } from '@/presentation/primitives/card';
import { Logo } from '@/presentation/primitives/logo';

const OnboardingLayout = async ({ children }: PropsWithChildren) => {
	return (
		<main className="w-full flex-1 center py-5">
			<Card className="w-120 h-full bg-transparent border-transparent ring-transparent shadow-transparent rounded-none ring-0 p-0 center gap-12">
				<CardHeader className="center rounded-t-none w-full flex-1">
					<Logo size="3xl" strokeWidth={1.25} />
				</CardHeader>

				<CardContent className="w-full">{children}</CardContent>
			</Card>
		</main>
	);
};

export default OnboardingLayout;
