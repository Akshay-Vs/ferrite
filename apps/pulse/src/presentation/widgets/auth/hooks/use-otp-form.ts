import { useForm } from '@tanstack/react-form';
import { useEffect, useRef, useState } from 'react';
import type { z } from 'zod/v4';
import useCountdown from '@/core/hooks/use-countdown';
import { resolveClerkError } from '@/core/utils/resolve-clerk-error';
import { otpFormSchema } from '../schemas/otp-form.zodschema';

interface Props {
	isReady: boolean;
	onFormSubmit: (values: z.infer<typeof otpFormSchema>) => Promise<void>;
	onResend: () => Promise<void>;
}

export const useOtpForm = ({ isReady, onFormSubmit, onResend }: Props) => {
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
			if (!isReady) return;

			setFormError(null);
			setFormSuccess(null);

			try {
				await onFormSubmit(value);
				setFormSuccess('Email verified successfully!');
			} catch (error: unknown) {
				form.reset();
				setOtpValue('');
				setFormError(resolveClerkError(error));
			}
		},
	});

	useEffect(() => {
		if (
			otpValue?.length === 6 &&
			isReady &&
			!form.state.isSubmitting &&
			!hasAutoSubmitted.current
		) {
			hasAutoSubmitted.current = true;
			form.handleSubmit();
		}

		if (otpValue?.length < 6) {
			hasAutoSubmitted.current = false;
		}
	}, [otpValue, isReady, form.state.isSubmitting, form.handleSubmit]);

	// Focus the input field on load
	useEffect(() => {
		if (isReady) {
			// Small timeout ensures the element is fully mounted and ready to be focused
			setTimeout(() => inputRef.current?.focus(), 50);
		}
	}, [isReady]);

	const resendCode = async () => {
		if (!isReady || !isTimeDue || isResending) return;

		setIsResending(true);
		setFormError(null);
		setFormSuccess(null);

		try {
			restartTimer();
			await onResend();
			setFormSuccess('Verification code sent');
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
