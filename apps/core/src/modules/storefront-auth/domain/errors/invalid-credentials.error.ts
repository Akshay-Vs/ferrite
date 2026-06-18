export class InvalidCredentialsError extends Error {
	readonly _tag = 'InvalidCredentialsError';
	constructor() {
		super('Invalid email or password');
	}
}
