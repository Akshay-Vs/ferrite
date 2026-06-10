import { toast } from '@/presentation/primitives/sonner';

export const copyToClipboard = (
	text: string,
	onSuccess?: () => void,
	onError?: () => void
) => {
	navigator.clipboard
		.writeText(text)
		.then(() =>
			onSuccess ? onSuccess() : toast.success('Copied to clipboard')
		)
		.catch(() => (onError ? onError() : toast.error('Failed to copy')));
};
