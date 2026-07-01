import { inter } from '@app/(config)/fonts';
import { appMetadata } from '@app/(config)/metadata';
import { ClerkProvider } from '@clerk/nextjs';
import { cn } from '@core/utils/cn';
import { SerwistProvider } from '@serwist/next/react';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import FerriteCoreProvider from '@/core/providers/ferrite-core.provider';
import QueryClientProvider from '@/core/providers/query-client.provider';
import ThemeProvider from '@/core/providers/theme.provider';
import TopLoaderProvider from '@/core/providers/top-loader.provider';
import { TooltipProvider } from '@/presentation/primitives/tooltip';

import '@presentation/styles/tailwind.css';
import '@presentation/styles/globals.scss';

export const metadata: Metadata = appMetadata;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			suppressHydrationWarning
			lang="en"
			className={cn('font-sans', inter.variable)}
		>
			<body className="antialiased bg-background text-content">
				<SerwistProvider
					swUrl="/sw.js"
					// disable={process.env.NODE_ENV === 'development'}
				>
					<div id="bg-gradient" />
					<ClerkProvider>
						<QueryClientProvider>
							<FerriteCoreProvider>
								<ThemeProvider>
									<TooltipProvider>
										<TopLoaderProvider>
											<Toaster />
											{children}
										</TopLoaderProvider>
									</TooltipProvider>
								</ThemeProvider>
							</FerriteCoreProvider>
						</QueryClientProvider>
					</ClerkProvider>
				</SerwistProvider>
			</body>
		</html>
	);
}
