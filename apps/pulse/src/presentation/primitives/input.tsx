import { Input as InputPrimitive } from '@base-ui/react/input';
import type * as React from 'react';
import { cn } from '@/core/utils/cn';

type InputProps = React.ComponentProps<'input'> & {
	render?: React.ReactNode;
	renderPosition?: 'left' | 'right';
	intractiveChild?: boolean;
};

const inputClassName =
	'h-15 w-full min-w-0 rounded-full gradient-border bg-input/30 px-8 py-1 text-base transition-[color,box-shadow,background-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 hover:border-accent/30 transition-colors duration-200';

function Input({
	className,
	type,
	render,
	renderPosition = 'left',
	intractiveChild = true,
	...props
}: InputProps) {
	const input = (
		<InputPrimitive
			type={type}
			data-slot="input"
			className={cn(
				inputClassName,
				render && (renderPosition === 'left' ? 'pl-14' : 'pr-14'),
				className
			)}
			{...props}
		/>
	);

	if (!render) return input;

	return (
		<div className="relative w-full">
			<span
				className={cn(
					'absolute top-1/2 -translate-y-1/2 text-muted-foreground',
					!intractiveChild && 'pointer-events-none',
					renderPosition === 'left' ? 'left-4' : 'right-4'
				)}
			>
				{render}
			</span>
			{input}
		</div>
	);
}

export { Input };
