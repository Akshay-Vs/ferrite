export class InvalidMfaCodeError extends Error {
	readonly _tag = 'InvalidMfaCodeError';
	constructor() {
		super('Invalid MFA code');
	}
}
