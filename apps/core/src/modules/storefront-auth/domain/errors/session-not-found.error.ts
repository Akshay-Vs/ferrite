export class SessionNotFoundError extends Error {
	readonly _tag = 'SessionNotFoundError';
	constructor() {
		super('Session not found');
	}
}
