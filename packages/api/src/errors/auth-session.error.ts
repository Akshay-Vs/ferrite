/**
 * Emitted when the request is rejected with a 401 Unauthorized.
 * When using a managed provider like Clerk, if a 401 reaches the client,
 * it indicates the session is unrecoverable (e.g. revoked, completely expired).
 * Consuming apps should catch this and redirect to login.
 */
export class AuthSessionError extends Error {
	override readonly name = 'AuthSessionError' as const;

	constructor(
		message: string,
		public override readonly cause?: unknown
	) {
		super(message);
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
