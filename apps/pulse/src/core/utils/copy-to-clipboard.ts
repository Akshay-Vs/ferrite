import { toast } from '@/presentation/primitives/sonner';

export const copyToClipboard = (
	text: string,
	onSuccess?: () => void,
	onError?: () => void
) => {
	if (typeof navigator === 'undefined' || !navigator.clipboard) {
		const fallbackError =
			onError ?? (() => toast.error('Clipboard not available'));
		fallbackError();
		return;
	}

	navigator.clipboard
		.writeText(text)
		.then(() =>
			onSuccess ? onSuccess() : toast.success('Copied to clipboard')
		)
		.catch(() => (onError ? onError() : toast.error('Failed to copy')));
};
