export class IncompleteConfigurationError extends Error {
	readonly _tag = 'IncompleteConfigurationError';

	constructor(message: string) {
		super(message);
		this.name = 'IncompleteConfigurationError';
	}
}
