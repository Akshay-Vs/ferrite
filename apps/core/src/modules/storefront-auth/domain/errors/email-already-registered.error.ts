export class EmailAlreadyRegisteredError extends Error {
	readonly _tag = 'EmailAlreadyRegisteredError';
	constructor() {
		super('Email address is already registered');
	}
}
