/**
 * Error thrown when an outbox event fails to be published to the queue.
 */
export class OutboxPublishError extends Error {
	readonly _tag = 'OutboxPublishError';
	constructor(eventType: string, cause?: unknown) {
		super(`Failed to publish outbox event: ${eventType}`);
		this.cause = cause;
	}
}
