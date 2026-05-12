/**
 * Emitted when the HTTP handshake fails:
 * network unreachable, 5xx responses, request timeouts, etc.
 */
export class ApiTransportError extends Error {
	override readonly name = 'ApiTransportError' as const;

	constructor(
		message: string,
		/** The originating cause (AxiosError, DOMException, etc.) */
		public override readonly cause?: unknown,
		/** HTTP status code, if available */
		public readonly status?: number
	) {
		super(message);
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
