import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContextStore {
	requestId: string;
	userId?: string;
	// add tenantId, sessionId, etc. here over time
}

export const requestContext = new AsyncLocalStorage<RequestContextStore>();
