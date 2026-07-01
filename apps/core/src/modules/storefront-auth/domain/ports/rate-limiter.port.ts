export const RATE_LIMITER = Symbol('RATE_LIMITER');

/**
 * Configuration for rate limiting
 * @property key - The key to use for rate limiting
 * @property windowMs - The time window in milliseconds
 * @property maxAttempts - The maximum number of attempts allowed in the time window
 */
export interface RateLimitConfig {
	key: string; // e.g., `rl:login:${storeId}:${email}`
	windowMs: number; // e.g. 15 * 60 * 1000
	maxAttempts: number; // e.g. 5
}

/**
 * Result of a rate limiting check
 * @property allowed - Whether the check was successful
 * @property remaining - The number of remaining attempts
 */
export interface RateLimitResult {
	allowed: boolean;
	remaining: number;
}

export interface IRateLimiter {
	check(config: RateLimitConfig): Promise<RateLimitResult>;
	reset(key: string): Promise<void>;
}
