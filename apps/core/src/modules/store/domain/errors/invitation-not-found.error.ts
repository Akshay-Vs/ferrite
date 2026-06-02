export class InvitationNotFoundError extends Error {
	readonly _tag = 'InvitationNotFoundError';

	constructor(message = 'Invitation not found') {
		super(message);
	}
}
