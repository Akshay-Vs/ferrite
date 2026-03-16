export class UserNotFoundError extends Error {
	constructor(identifier: string) {
		super(`User not found: ${identifier}`);
		this.name = 'UserNotFoundError';
	}
}
