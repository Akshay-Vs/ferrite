export class UserExistsError extends Error {
	constructor(identifier: string) {
		super(`User already exists: ${identifier}`);
		this.name = 'UserExistsError';
	}
}
