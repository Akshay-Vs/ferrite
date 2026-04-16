import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import NextTopLoader from 'nextjs-toploader';
import { inter } from '@/app/(config)/fonts';
import { cn } from '@/core/utils/utils';
import { appMetadata } from './(config)/metadata';

import '@/presentation/styles/tailwind.css';
import '@/presentation/styles/globals.scss';

export const metadata: Metadata = appMetadata;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider>
			<html lang="en" className={cn('font-sans', inter.variable)}>
				<body className={`antialiased bg-bg`}>
					<div className="min-h-dvh w-dvw p-6">
						<NextTopLoader color="#A68BF8FA" height={3} showSpinner={false} />
						{children}
					</div>
				</body>
			</html>
		</ClerkProvider>
	);
}
