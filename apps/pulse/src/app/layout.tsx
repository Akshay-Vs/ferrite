import { inter } from '@app/(config)/fonts';
import { appMetadata } from '@app/(config)/metadata';
import { ClerkProvider } from '@clerk/nextjs';
import { cn } from '@core/utils/utils';
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
		<html lang="en" className={cn('font-sans', inter.variable)}>
			<body className="antialiased bg-background text-content">
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
			</body>
		</html>
	);
}
