import { exponentialBackoff } from '@libs/backoff/exponential-backoff';
import { Logger } from '@nestjs/common';

export interface RetryOptions {
	retries: number;
	initialDelay?: number;
	maxDelay?: number;
	logger?: Logger;
	onRetry?: (attempt: number, error: Error) => void;
}

export async function retryWithBackoff(
	fn: () => Promise<void>,
	{
		retries,
		initialDelay = 500,
		maxDelay = 30_000,
		logger,
		onRetry,
	}: RetryOptions
): Promise<boolean> {
	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			await fn();
			return true;
		} catch (err) {
			const error = err as Error;
			logger?.error(`Attempt ${attempt}/${retries} failed: ${error.message}`);
			onRetry?.(attempt, error);

			if (attempt < retries) {
				const delay = exponentialBackoff({ initialDelay, maxDelay, attempt });
				await sleep(delay);
			}
		}
	}
	return false;
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
