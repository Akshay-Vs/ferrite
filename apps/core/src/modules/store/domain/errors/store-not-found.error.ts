export class StoreNotFoundError extends Error {
	readonly _tag = 'StoreNotFoundError';

	constructor(storeIdOrSlug: string) {
		super(`Store ${storeIdOrSlug} not found`);
	}
}
