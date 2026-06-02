export class InvitationExpiredError extends Error {
	readonly _tag = 'InvitationExpiredError';

	constructor(message = 'Invitation has expired') {
		super(message);
	}
}
