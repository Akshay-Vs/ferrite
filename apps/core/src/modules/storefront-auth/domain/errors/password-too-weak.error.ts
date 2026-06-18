export class PasswordTooWeakError extends Error {
	readonly _tag = 'PasswordTooWeakError';
	constructor(
		message: string = 'Password does not meet complexity requirements'
	) {
		super(message);
	}
}
