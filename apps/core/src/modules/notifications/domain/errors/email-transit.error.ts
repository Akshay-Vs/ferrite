export class EmailTransitError extends Error {
	readonly _tag = 'FailedSendingEmailError';

	constructor(message: string) {
		super(message);
	}
}
