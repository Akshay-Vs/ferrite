'use client';

import { Eye, EyeOff } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/core/utils/utils';
import { Input } from './input';

export const PasswordInput = React.forwardRef<
	HTMLInputElement,
	React.ComponentProps<'input'>
>(({ className, ...props }, ref) => {
	const [showPassword, setShowPassword] = React.useState(false);

	return (
		<div className="relative w-full">
			<Input
				type={showPassword ? 'text' : 'password'}
				className={cn('pr-12', className)}
				ref={ref}
				{...props}
			/>
			<button
				type="button"
				tabIndex={-1}
				onClick={() => setShowPassword((prev) => !prev)}
				className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:text-foreground transition-colors"
				aria-label={showPassword ? 'Hide password' : 'Show password'}
			>
				{showPassword ? (
					<EyeOff className="h-5 w-5 mr-2" />
				) : (
					<Eye className="h-5 w-5 mr-2" />
				)}
			</button>
		</div>
	);
});
PasswordInput.displayName = 'PasswordInput';
