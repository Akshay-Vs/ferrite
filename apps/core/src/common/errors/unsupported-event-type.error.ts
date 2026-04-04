export class UnsupportedEventTypeError extends Error {
	constructor(eventType: string) {
		super(`Event type not supported: ${eventType}`);
		this.name = 'UnsupportedEventTypeError';
	}
}
