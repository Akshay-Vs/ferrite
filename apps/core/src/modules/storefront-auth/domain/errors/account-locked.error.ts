export class AccountLockedError extends Error {
	readonly _tag = 'AccountLockedError';
	constructor(public readonly lockedUntil: Date) {
		super(`Account temporarily locked until ${lockedUntil.toISOString()}`);
	}
}
