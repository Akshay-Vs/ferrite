import type * as React from 'react';

import { cn } from '@/core/utils/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				'flex field-sizing-content min-h-44 w-full resize-none rounded-[2rem] gradient-border px-8 py-6 text-base transition-[color,box-shadow,background-color] outline-none',

				// Typography & Placeholder
				'placeholder:text-muted-foreground md:text-sm',

				// Interaction States
				'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
				'disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none',

				// Validation States
				'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
				'dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',

				className
			)}
			{...props}
		/>
	);
}

export { Textarea };
