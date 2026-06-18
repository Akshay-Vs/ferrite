export class OauthStateMismatchError extends Error {
	readonly _tag = 'OauthStateMismatchError';
	constructor() {
		super('OAuth state mismatch - possible CSRF attack');
	}
}
