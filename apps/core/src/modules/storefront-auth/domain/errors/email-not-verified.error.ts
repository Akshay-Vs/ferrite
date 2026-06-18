export class EmailNotVerifiedError extends Error {
	readonly _tag = 'EmailNotVerifiedError';
	constructor() {
		super('Email address is not verified');
	}
}
