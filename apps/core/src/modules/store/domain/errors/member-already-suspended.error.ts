export class MemberAlreadySuspendedError extends Error {
	readonly _tag = 'MemberAlreadySuspendedError';

	constructor(userId: string, storeId: string) {
		super(`User ${userId} is already suspended in store ${storeId}`);
	}
}
