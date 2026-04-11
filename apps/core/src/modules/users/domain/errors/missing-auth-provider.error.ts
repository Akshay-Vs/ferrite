export class MissingAuthProviderError extends Error {
	constructor(identifier: string) {
		super(`User missing auth provider: ${identifier}`);
		this.name = 'MissingAuthProviderError';
	}
}
