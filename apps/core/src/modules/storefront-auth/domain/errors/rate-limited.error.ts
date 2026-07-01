import { HttpException, HttpStatus } from '@nestjs/common';

export class RateLimitedError extends HttpException {
	readonly _tag = 'RateLimitedError';
	constructor(public readonly retryAfter?: number) {
		super(
			'Too many attempts, please try again later',
			HttpStatus.TOO_MANY_REQUESTS
		);
	}
}
