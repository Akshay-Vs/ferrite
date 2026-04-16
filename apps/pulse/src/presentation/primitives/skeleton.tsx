import { cn } from '@/core/utils/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="skeleton"
			className={cn('animate-pulse bg-surface', className)}
			{...props}
		/>
	);
}

export { Skeleton };
