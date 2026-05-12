import { createQueryKeyStore } from '@lukemorales/query-key-factory';

/**
 * Centralized registry for all TanStack Query Keys used in the SDK.
 * Implemented via @lukemorales/query-key-factory.
 */
export const queryKeys = createQueryKeyStore({
	stores: {
		all: null,
		detail: (storeId: string) => [storeId],
		roles: (storeId: string) => [storeId, 'roles'],
		members: (storeId: string) => [storeId, 'members'],
	},
	users: {
		me: null,
		all: (cursor?: string, limit?: string) => [cursor, limit],
		detail: (userId: string) => [userId],
	},
	onboarding: {
		session: null,
	},
	helloWorld: {
		greeting: null,
	},
});
