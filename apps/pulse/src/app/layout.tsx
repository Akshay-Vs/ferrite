import { inter } from '@app/(config)/fonts';
import { appMetadata } from '@app/(config)/metadata';
import { ClerkProvider } from '@clerk/nextjs';
import { cn } from '@core/utils/utils';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import NextTopLoader from 'nextjs-toploader';

import '@presentation/styles/tailwind.css';
import '@presentation/styles/globals.scss';
import { Toaster } from 'sonner';

export const metadata: Metadata = appMetadata;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={cn('font-sans', inter.variable)}>
			<body className="antialiased bg-background text-content">
				<ClerkProvider>
					<div className="min-h-dvh max-w-dvw flex flex-col">
						<ThemeProvider
							attribute="class"
							defaultTheme="dark"
							enableSystem={false}
							disableTransitionOnChange
						>
							<NextTopLoader color="#A68BF8FA" height={3} showSpinner={false} />
							<Toaster />

							{children}
						</ThemeProvider>
					</div>
				</ClerkProvider>
			</body>
		</html>
	);
}
