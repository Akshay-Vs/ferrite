'use client';

import { OTPInput, OTPInputContext } from 'input-otp';
import { MinusIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/core/utils/utils';

const InputOTP = React.forwardRef<
	React.ComponentRef<typeof OTPInput>,
	React.ComponentPropsWithoutRef<typeof OTPInput> & {
		containerClassName?: string;
	}
>(({ className, containerClassName, ...props }, ref) => (
	<OTPInput
		ref={ref}
		data-slot="input-otp"
		containerClassName={cn(
			'cn-input-otp flex items-center has-disabled:opacity-50',
			containerClassName
		)}
		spellCheck={false}
		className={cn('disabled:cursor-not-allowed', className)}
		{...props}
	/>
));
InputOTP.displayName = 'InputOTP';

function InputOTPGroup({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="input-otp-group"
			className={cn(
				'flex items-center rounded-3xl has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40',
				className
			)}
			{...props}
		/>
	);
}

function InputOTPSlot({
	index,
	className,
	...props
}: React.ComponentProps<'div'> & {
	index: number;
}) {
	const inputOTPContext = React.useContext(OTPInputContext);
	const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

	return (
		<div
			data-slot="input-otp-slot"
			data-active={isActive}
			className={cn(
				'relative flex size-16 items-center justify-center border-5 border-active bg-input/50 px-8 py-1 text-base transition-[color,box-shadow,background-color] ring-border first:rounded-l-3xl first:border-l last:rounded-r-3xl aria-invalid:border-destructive data-[active=true]:z-10 data-[active=true]:border-border data-[active=true]:ring-2 data-[active=true]:ring-accent data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40',
				className
			)}
			{...props}
		>
			{char}
			{hasFakeCaret && (
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
					<div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
				</div>
			)}
		</div>
	);
}

function InputOTPSeparator({ ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="input-otp-separator"
			className="flex items-center [&_svg:not([class*='size-'])]:size-4"
			{...props}
		>
			<MinusIcon />
		</div>
	);
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
