import { useForm } from '@tanstack/react-form';
import { useEffect, useRef, useState } from 'react';
import type { z } from 'zod/v4';
import useCountdown from '@/core/hooks/use-countdown';
import { resolveClerkError } from '@/core/utils/resolve-clerk-error';
import { otpFormSchema } from '../schemas/otp-form.zodschema';

interface Props {
	onFormSubmit: (
		values: z.infer<typeof otpFormSchema>
	) => Promise<{ error?: unknown } | undefined>;
	onResend: () => Promise<{ error?: unknown } | undefined>;
}

export const useOtpForm = ({ onFormSubmit, onResend }: Props) => {
	const [formError, setFormError] = useState<string | null>(null);
	const [formSuccess, setFormSuccess] = useState<string | null>(null);
	const { timeLeft, isTimeDue, restartTimer } = useCountdown();
	const hasAutoSubmitted = useRef(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const [isResending, setIsResending] = useState(false);
	const [otpValue, setOtpValue] = useState('');

	const form = useForm({
		defaultValues: {
			otp: '',
		},
		validators: {
			onSubmit: otpFormSchema,
		},
		onSubmit: async ({ value }) => {
			setFormError(null);
			setFormSuccess(null);

			try {
				const result = await onFormSubmit(value);

				// Evaluate deterministic error payloads from the Core 3 API
				if (result?.error) {
					form.reset();
					setOtpValue('');
					setFormError(resolveClerkError(result.error));
					return;
				}

				setFormSuccess('Email verified successfully!');
			} catch (error: unknown) {
				// Failsafe for unhandled network exceptions
				form.reset();
				setOtpValue('');
				setFormError(resolveClerkError(error));
			}
		},
	});

	useEffect(() => {
		if (
			otpValue?.length === 6 &&
			!form.state.isSubmitting &&
			!hasAutoSubmitted.current
		) {
			hasAutoSubmitted.current = true;
			form.handleSubmit();
		}

		if (otpValue?.length < 6) {
			hasAutoSubmitted.current = false;
		}
	}, [otpValue, form.state.isSubmitting, form.handleSubmit]);

	// Focus the input field on load synchronously
	useEffect(() => {
		setTimeout(() => inputRef.current?.focus(), 50);
	}, []);

	const resendCode = async () => {
		if (!isTimeDue || isResending) return;

		setIsResending(true);
		setFormError(null);
		setFormSuccess(null);

		try {
			restartTimer();
			const result = await onResend();

			if (result?.error) {
				setFormError(resolveClerkError(result.error));
			} else {
				setFormSuccess('Verification code sent');
			}
		} catch (error: unknown) {
			setFormError(resolveClerkError(error));
		} finally {
			setIsResending(false);
		}
	};

	return {
		form,
		formError,
		formSuccess,
		resendCode,
		isResending,
		isTimeDue,
		timeLeft,
		setOtpValue,
		inputRef,
	};
};
