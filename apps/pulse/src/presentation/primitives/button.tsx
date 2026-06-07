import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { memo, type ReactNode, useMemo } from 'react';
import { cn } from '@/core/utils/cn';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

const buttonVariants = cva(
	"group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding whitespace-nowrap transition-colors duration-200 ease-in-out outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer font-normal text-base active:scale-98",
	{
		variants: {
			variant: {
				default:
					'bg-surface border-2 gradient-border hover:border-accent/30 text-content aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
				secondary: 'bg-primary text-primary-foreground hover:bg-primary/80',
				outline:
					'border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:bg-transparent dark:hover:bg-input/30',
				ghost: 'aria-expanded:bg-muted aria-expanded:text-foreground',
				destructive:
					'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				default:
					'h-15 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5',
				xs: "h-6 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
				sm: 'h-8 gap-1 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
				lg: 'h-16 gap-1.5 px-8 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
				icon: 'size-16',
				'icon-xs': "size-6 [&_svg:not([class*='size-'])]:size-3",
				'icon-sm': 'size-8',
				'icon-lg': 'size-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
);

// Stable reference — defined outside the component so it is never recreated
const DEFAULT_LOADING_CONTENT = (
	<>
		<Loader2 className="animate-spin" aria-hidden="true" />
		<span className="sr-only">Loading…</span>
	</>
);

type ButtonProps = ButtonPrimitive.Props &
	VariantProps<typeof buttonVariants> & {
		isLoading?: boolean;
		loadingText?: string;
		children?: ReactNode;
		tooltip?: string;
		tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
	};

const Button = memo(function Button({
	className,
	loadingText,
	children,
	tooltip,
	disabled,
	variant = 'default',
	size = 'default',
	isLoading = false,
	type = 'button',
	tooltipPosition = 'top',
	...props
}: ButtonProps) {
	const isDisabled = disabled || isLoading;

	const resolvedClassName = useMemo(
		() => cn(buttonVariants({ variant, size, className })),
		[variant, size, className]
	);

	const content = isLoading
		? (loadingText ?? DEFAULT_LOADING_CONTENT)
		: children;

	const button = (
		<ButtonPrimitive
			data-slot="button"
			className={resolvedClassName}
			disabled={isDisabled}
			type={type}
			aria-busy={isLoading || undefined}
			{...props}
		>
			{content}
		</ButtonPrimitive>
	);

	// Return the button if no tooltip is provided
	if (!tooltip) return button;

	return (
		<Tooltip>
			<TooltipTrigger render={button} />
			<TooltipContent side={tooltipPosition}>{tooltip}</TooltipContent>
		</Tooltip>
	);
});

Button.displayName = 'Button';

export { Button, buttonVariants };
