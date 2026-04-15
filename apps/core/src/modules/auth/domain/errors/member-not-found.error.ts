export class MemberNotFoundError extends Error {
	readonly _tag = 'MemberNotFoundError';

	constructor(userId: string, storeId: string) {
		super(`User ${userId} is not a member of store ${storeId}`);
	}
}
