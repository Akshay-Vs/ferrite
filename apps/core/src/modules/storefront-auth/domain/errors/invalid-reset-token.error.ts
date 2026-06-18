export class InvalidResetTokenError extends Error {
	readonly _tag = 'InvalidResetTokenError';
	constructor() {
		super('Invalid or expired password reset token');
	}
}
