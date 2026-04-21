'use client';

import {
	CheckCircle2,
	InfoIcon,
	Loader2Icon,
	OctagonXIcon,
	TriangleAlertIcon,
} from 'lucide-react';
import { toast as sonnerToast } from 'sonner';

interface ToastAction {
	label: string;
	onClick: () => void;
}

export interface CustomToastProps {
	id: string | number;
	title: string;
	description?: string;
	type?: 'success' | 'info' | 'warning' | 'error' | 'loading' | 'default';
	action?: ToastAction;
	cancel?: ToastAction;
}

// Map standard variants to their respective Lucide icons
const toastIcons = {
	success: <CheckCircle2 className="size-4 text-green-500" />,
	info: <InfoIcon className="size-4 text-blue-500" />,
	warning: <TriangleAlertIcon className="size-4 text-amber-500" />,
	error: <OctagonXIcon className="size-4 text-destructive" />,
	loading: (
		<Loader2Icon className="size-4 animate-spin text-muted-foreground" />
	),
	default: null,
};

/**
 * The Core UI Component
 * This exclusively utilizes your established design system. No Sonner variables can interfere.
 */
export function HeadlessToast({
	id,
	title,
	description,
	type = 'default',
	action,
	cancel,
}: CustomToastProps) {
	return (
		<div className="group relative flex w-full md:w-100 items-start gap-4 overflow-hidden rounded-[2rem] px-8 py-6 shadow-2xl backdrop-blur-xl bg-surface/90 border-2 border-border-gradient outline-none select-none cursor-pointer pointer-events-auto">
			{/* Content Topology */}
			<div className="flex flex-1 flex-col gap-1.5">
				<div className="flex items-center gap-3 text-base font-semibold text-foreground">
					{toastIcons[type] && (
						<div className="flex shrink-0 items-center justify-center">
							{toastIcons[type]}
						</div>
					)}
					{title}
				</div>

				{description && (
					<p className="text-sm leading-relaxed text-muted-foreground">
						{description}
					</p>
				)}

				{/* Action Button Matrix */}
				{(action || cancel) && (
					<div className="mt-3 flex flex-wrap gap-3">
						{action && (
							<button
								type="button"
								className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-3 focus-visible:ring-ring/30 outline-none"
								onClick={() => {
									action.onClick();
									sonnerToast.dismiss(id);
								}}
							>
								{action.label}
							</button>
						)}
						{cancel && (
							<button
								type="button"
								className="rounded-full bg-muted px-5 py-2 text-sm font-medium text-muted-foreground transition-opacity hover:opacity-90 focus-visible:ring-3 focus-visible:ring-ring/30 outline-none"
								onClick={() => {
									cancel.onClick();
									sonnerToast.dismiss(id);
								}}
							>
								{cancel.label}
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

/**
 * The API Wrapper
 */
export const toast = {
	success: (
		title: string,
		options?: Omit<CustomToastProps, 'id' | 'title' | 'type'>
	) =>
		sonnerToast.custom((id) => (
			<HeadlessToast id={id} title={title} type="success" {...options} />
		)),

	error: (
		title: string,
		options?: Omit<CustomToastProps, 'id' | 'title' | 'type'>
	) =>
		sonnerToast.custom((id) => (
			<HeadlessToast id={id} title={title} type="error" {...options} />
		)),

	info: (
		title: string,
		options?: Omit<CustomToastProps, 'id' | 'title' | 'type'>
	) =>
		sonnerToast.custom((id) => (
			<HeadlessToast id={id} title={title} type="info" {...options} />
		)),

	warning: (
		title: string,
		options?: Omit<CustomToastProps, 'id' | 'title' | 'type'>
	) =>
		sonnerToast.custom((id) => (
			<HeadlessToast id={id} title={title} type="warning" {...options} />
		)),

	loading: (
		title: string,
		options?: Omit<CustomToastProps, 'id' | 'title' | 'type'>
	) =>
		sonnerToast.custom((id) => (
			<HeadlessToast id={id} title={title} type="loading" {...options} />
		)),

	default: (
		title: string,
		options?: Omit<CustomToastProps, 'id' | 'title' | 'type'>
	) =>
		sonnerToast.custom((id) => (
			<HeadlessToast id={id} title={title} type="default" {...options} />
		)),

	dismiss: (id?: string | number) => sonnerToast.dismiss(id),

	/**
	 * Advanced Promise Orchestration with Conditional Retry Capabilities
	 */
	promise: <T,>(
		promiseGenerator: Promise<T> | (() => Promise<T>),
		options: {
			loading: string | Omit<CustomToastProps, 'id' | 'type'>;
			success:
				| string
				| Omit<CustomToastProps, 'id' | 'type'>
				| ((data: T) => string | Omit<CustomToastProps, 'id' | 'type'>);
			error:
				| string
				| Omit<CustomToastProps, 'id' | 'type'>
				| ((
						error: unknown,
						retry?: () => void // Modified to specify retry as optional
				  ) => string | Omit<CustomToastProps, 'id' | 'type'>);
		}
	) => {
		// Utility to normalize inputs into structured props
		const resolveProps = (
			val: any,
			data?: any
		): Omit<CustomToastProps, 'id' | 'type'> => {
			const resolved = typeof val === 'function' ? val(data) : val;
			return typeof resolved === 'string' ? { title: resolved } : resolved;
		};

		// Generate a stable ID to anchor the component across state transitions
		const toastId = sonnerToast.custom((t) => (
			<HeadlessToast id={t} type="loading" {...resolveProps(options.loading)} />
		));

		// Define the execution matrix, enabling conditional recursive retries
		const execute = () => {
			// Re-hydrate the loading state (critical for subsequent retry invocations)
			sonnerToast.custom(
				(t) => (
					<HeadlessToast
						id={t}
						type="loading"
						{...resolveProps(options.loading)}
					/>
				),
				{ id: toastId }
			);

			// Evaluate the promise. If a raw promise is passed, it evaluates immediately;
			// if a closure is passed, it spawns a fresh execution context (required for retries).
			const isFactory = typeof promiseGenerator === 'function';
			const p = isFactory ? promiseGenerator() : promiseGenerator;

			p.then((data) => {
				sonnerToast.custom(
					(t) => (
						<HeadlessToast
							id={t}
							type="success"
							{...resolveProps(options.success, data)}
						/>
					),
					{ id: toastId }
				);
			}).catch((err) => {
				sonnerToast.custom(
					(t) => {
						// Specialized resolution for error to conditionally inject the retry closure
						const errorProps =
							typeof options.error === 'function'
								? isFactory
									? options.error(err, execute)
									: options.error(err)
								: typeof options.error === 'string'
									? { title: options.error }
									: options.error;

						return (
							<HeadlessToast
								id={t}
								type="error"
								{...(typeof errorProps === 'string'
									? { title: errorProps }
									: errorProps)}
							/>
						);
					},
					{ id: toastId }
				);
			});

			return p;
		};

		return execute();
	},
};
