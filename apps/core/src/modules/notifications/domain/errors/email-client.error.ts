export class EmailClientError extends Error {
	readonly _tag = 'FailedEmailClientError';

	constructor(
		message: string,
		public readonly status: number
	) {
		super(message);
	}
}
