'use client';

import type { z } from 'zod/v4';
import { Button } from '@/presentation/primitives/button';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@/presentation/primitives/field';
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from '@/presentation/primitives/input-otp';
import { useOtpForm } from '../hooks/use-otp-form';
import type { otpFormSchema } from '../schemas/otp-form.zodschema';

interface OTPFormProps {
	isReady: boolean;
	onFormSubmit: (values: z.infer<typeof otpFormSchema>) => Promise<void>;
	onResend: () => Promise<void>;
}

export const OTPForm = ({ onFormSubmit, onResend, isReady }: OTPFormProps) => {
	const {
		form,
		formError,
		formSuccess,
		resendCode,
		isResending,
		isTimeDue,
		timeLeft,
		inputRef,
		setOtpValue,
	} = useOtpForm({ isReady, onFormSubmit, onResend });
	return (
		<div className="flex flex-col w-100 gap-12 flex-1 h-full">
			<form
				className="flex flex-col gap-6"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<FieldGroup>
					<form.Field name="otp">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid} className="gap-8">
									<FieldLabel htmlFor={field.name} className="ml-1 sr-only">
										Verification code
									</FieldLabel>
									<InputOTP
										maxLength={6}
										id={field.name}
										ref={inputRef}
										value={field.state.value}
										onChange={(value) => {
											field.handleChange(value);
											setOtpValue(value);
										}}
									>
										<InputOTPGroup className="gap-4 mb-5 *:data-[slot=input-otp-slot]:rounded-full *:data-[slot=input-otp-slot]:border w-110 center">
											<InputOTPSlot index={0} />
											<InputOTPSlot index={1} />
											<InputOTPSlot index={2} />
											<InputOTPSlot index={3} />
											<InputOTPSlot index={4} />
											<InputOTPSlot index={5} />
										</InputOTPGroup>
									</InputOTP>
									<FieldDescription className="w-full text-center">
										Enter the 6-digit code sent to your email.
									</FieldDescription>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
				</FieldGroup>

				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, isSubmitting]) => (
						<div className="col gap-4 mt-2">
							{formError && (
								<div className="text-destructive text-sm font-medium text-center bg-destructive/10 py-4 rounded-full">
									{formError}
								</div>
							)}
							{formSuccess && (
								<div className="text-emerald-600 text-sm font-medium text-center bg-emerald-500/10 py-4 rounded-full">
									{formSuccess}
								</div>
							)}
							<Button
								type="submit"
								disabled={!canSubmit || Boolean(isSubmitting) || !isReady}
								isLoading={Boolean(isSubmitting)}
								className="w-full h-15 rounded-full font-normal text-base"
							>
								Verify
							</Button>

							<div id="clerk-captcha" />

							<FieldDescription className="text-center flex items-center justify-center gap-1">
								Didn&apos;t receive the code?
								<Button
									variant="ghost"
									className="underline underline-offset-2 hover:text-primary"
									size="sm"
									disabled={Boolean(isSubmitting) || !isTimeDue || isResending}
									isLoading={isResending}
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										resendCode();
									}}
								>
									Resend{!isTimeDue && ` in ${Math.floor(timeLeft / 1000)}s`}
								</Button>
							</FieldDescription>
						</div>
					)}
				</form.Subscribe>
			</form>
		</div>
	);
};
