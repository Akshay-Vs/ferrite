/**
 * Emitted when a payload fails Zod schema validation.
 * Carries the full ZodError so callers can surface granular field messages.
 */
export class ContractViolationError extends Error {
	override readonly name = 'ContractViolationError' as const;

	constructor(
		/** The ZodError from a failed `safeParse` */
		public readonly zodError: import('zod/v4').ZodError,
		/** The raw payload that failed validation */
		public readonly rawPayload?: unknown,
		/** Indicates if the violation occurred on the outgoing request or inbound response */
		public readonly context: 'request' | 'response' = 'response'
	) {
		super(
			`${context === 'request' ? 'Outgoing request payload' : 'Backend response'} failed schema validation: ${zodError.issues.map((i) => `[${i.path.join('.')}] ${i.message}`).join('; ')}`
		);
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
