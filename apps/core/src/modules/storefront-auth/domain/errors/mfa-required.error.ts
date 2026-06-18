export class MfaRequiredError extends Error {
	readonly _tag = 'MfaRequiredError';
	constructor(public readonly challengeToken: string) {
		super('Multi-factor authentication is required');
	}
}
