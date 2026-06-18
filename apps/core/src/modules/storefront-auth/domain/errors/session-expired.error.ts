export class SessionExpiredError extends Error {
	readonly _tag = 'SessionExpiredError';
	constructor(public readonly reason: 'absolute' | 'idle' = 'absolute') {
		super(`Session expired (${reason})`);
	}
}
