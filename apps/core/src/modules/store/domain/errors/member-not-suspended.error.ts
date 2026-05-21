export class MemberNotSuspendedError extends Error {
	readonly _tag = 'MemberNotSuspendedError';

	constructor(userId: string, storeId: string) {
		super(`User ${userId} is not suspended in store ${storeId}`);
	}
}
