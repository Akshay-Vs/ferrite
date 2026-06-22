'use client';

import { ArrowLeft, Loader2, XIcon } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { Suspense } from 'react';
import { DelayedRender } from '@/core/utils/delayed-render';
import SlideScreen from '@/presentation/animations/slide-screen';
import { Button } from '@/presentation/primitives/button';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@/presentation/primitives/sheet';
import { getScreen, getScreenTitle } from './screen-registry';
import type { SheetRoute } from './sheet-route.types';
import { sheetRouter, useSheetRouterStore } from './sheet-router.store';

// Screen renderer — resolves the component from the registry
const ScreenRenderer = ({ route }: { route: SheetRoute }) => {
	const entry = getScreen(route.name as string);

	if (!entry) {
		return (
			<div className="col center gap-2 py-20 text-muted-foreground">
				<p className="text-base font-medium">Screen not found</p>
				<p className="text-sm font-mono">{String(route.name)}</p>
			</div>
		);
	}

	const Component = entry.component;
	return <Component params={route.params} />;
};

// Header — auto-generated back arrow + title when stack depth > 1

const SheetScreenHeader = ({
	route,
	canGoBack,
}: {
	route: SheetRoute;
	canGoBack: boolean;
}) => {
	const title = getScreenTitle(route.name as string);

	return (
		<SheetHeader className="pb-1">
			<div className="flex items-center gap-3">
				{canGoBack && (
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={() => sheetRouter.pop()}
						className="shrink-0"
					>
						<ArrowLeft className="size-4" />
						<span className="sr-only">Back</span>
					</Button>
				)}
				<div className="col gap-1 min-w-0">
					<SheetTitle className="text-xl truncate">{title}</SheetTitle>
					<SheetDescription className="sr-only">
						{title} details panel
					</SheetDescription>
				</div>
			</div>
		</SheetHeader>
	);
};

// SheetRouter — the single global sheet with a navigation stack

/**
 * Mount once in the app layout. Renders a single `<Sheet>` primitive
 * and manages an internal navigation stack with animated transitions.
 */
export const SheetRouter = () => {
	const stack = useSheetRouterStore((s) => s.stack);
	const direction = useSheetRouterStore((s) => s.direction);

	const isOpen = stack.length > 0;
	const topRoute = stack.at(-1);
	const canGoBack = stack.length > 1;

	return (
		<Sheet open={isOpen} onOpenChange={(open) => !open && sheetRouter.close()}>
			<SheetContent
				showCloseButton={!canGoBack}
				className="overflow-y-auto overflow-x-hidden full"
			>
				<div className="relative">
					{/* Close button when navigated deep — placed at fixed position */}
					{canGoBack && (
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={() => sheetRouter.close()}
							className="absolute top-4 right-4 z-10 bg-secondary"
						>
							<XIcon className="size-4" />
							<span className="sr-only">Close</span>
						</Button>
					)}

					<AnimatePresence mode="popLayout" custom={direction} initial={false}>
						{topRoute && (
							<SlideScreen
								key={`${String(topRoute.name)}-${JSON.stringify(topRoute.params)}`}
								direction={direction}
								className="flex h-full flex-col"
							>
								<SheetScreenHeader route={topRoute} canGoBack={canGoBack} />
								<div className="flex-1 pb-6 full">
									<Suspense
										fallback={
											<DelayedRender delay={300}>
												<div className="h-[80vh] col gap-4 center">
													<Loader2 className="animate-spin" />
													<p className="text-sm font-mono text-muted-foreground">
														Hang tight...
													</p>
												</div>
											</DelayedRender>
										}
									>
										<ScreenRenderer route={topRoute} />
									</Suspense>
								</div>
							</SlideScreen>
						)}
					</AnimatePresence>
				</div>
			</SheetContent>
		</Sheet>
	);
};

// Hook for consuming stack length reactively (for conditional rendering)

/** Returns the current stack depth reactively. */
export const useSheetStackLength = (): number => {
	return useSheetRouterStore((s) => s.stack.length);
};
