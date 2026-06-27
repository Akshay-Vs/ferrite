export class EmailAlreadyRegisteredError extends Error {
	readonly _tag = 'EmailAlreadyRegisteredError';

	constructor(message: string = 'Email already exists') {
		super(message);
		this.name = 'EmailAlreadyRegisteredError';
	}
}
