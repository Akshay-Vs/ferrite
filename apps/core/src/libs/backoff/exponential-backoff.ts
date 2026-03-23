export interface ExponentialBackoffOptions {
	initialDelay: number;
	maxDelay: number;
	attempt: number;
}

export function exponentialBackoff({
	initialDelay,
	maxDelay,
	attempt,
}: ExponentialBackoffOptions): number {
	return Math.min(initialDelay * 2 ** (attempt - 1), maxDelay);
}
