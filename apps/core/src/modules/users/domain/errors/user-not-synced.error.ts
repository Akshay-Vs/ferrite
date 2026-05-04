export class UserNotSyncedError extends Error {
	readonly _tag = 'UserNotSyncedError';

	constructor(userId: string) {
		super(`User ${userId} has not yet been synced to the database.`);
	}
}
