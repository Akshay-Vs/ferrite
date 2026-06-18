export class RateLimitedError extends Error {
	readonly _tag = 'RateLimitedError';
	constructor() {
		super('Too many attempts, please try again later');
	}
}
