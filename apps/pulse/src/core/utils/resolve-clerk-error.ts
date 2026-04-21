import type { ClerkAPIError } from '@clerk/shared/types';

export const resolveClerkError = (error: unknown) => {
	if (error && typeof error === 'object' && 'errors' in error) {
		const clerkError = error as { errors: ClerkAPIError[] };

		if (clerkError.errors && clerkError.errors.length > 0) {
			const message = clerkError?.errors[0]?.message;

			if (message?.includes('Invalid verification strategy')) {
				return 'Use your original sign-in method.';
			}

			return message;
		} else {
			return 'An unknown error occurred';
		}
	} else {
		return 'Something went wrong';
	}
};
