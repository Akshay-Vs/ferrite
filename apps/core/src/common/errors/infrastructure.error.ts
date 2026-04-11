/**
 * Generic error class meant to encapsulate failures occurring within the
 * infrastructure layer (e.g., Database outages, Queue/Outbox failures, HTTP connection drops).
 *
 * Used across Hexagonal application use cases in Result types to safely map
 * unrecoverable third-party or system disruptions without leaking exceptions.
 */
export class InfrastructureError extends Error {
	constructor(
		message: string,
		public readonly cause?: unknown
	) {
		super(message);
		this.name = 'InfrastructureError';
	}
}
