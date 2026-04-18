import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import { OVERVIEW } from '@/core/constants/routes.constrains';
import { Card, CardContent, CardHeader } from '@/presentation/primitives/card';
import { Logo } from '@/presentation/primitives/logo';

const layout = async ({ children }: PropsWithChildren) => {
	const { isAuthenticated } = await auth();

	if (isAuthenticated) {
		return redirect(OVERVIEW);
	}

	return (
		<main className="w-full flex-1 center">
			<Card className="w-130 h-full bg-transparent border-transparent ring-transparent shadow-transparent rounded-none ring-0 p-0 center gap-12">
				<CardHeader className="center rounded-t-none">
					<Logo size="3xl" strokeWidth={1.25} />
				</CardHeader>

				<CardContent>{children}</CardContent>
			</Card>
		</main>
	);
};

export default layout;
