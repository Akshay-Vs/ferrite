import { type CustomDecorator, SetMetadata } from '@nestjs/common';

export type AuthRealm =
	| 'platform'
	| 'storefront'
	| 'public'
	| 'webhook'
	| 'internal';

export const AUTH_REALM = Symbol('AUTH_REALM');

/**
 * Marks a controller or route as belonging to the Platform authentication realm.
 * Platform routes are for merchants/admins managing their stores via Pulse,
 * authenticated via Clerk.
 */
export const PlatformRoute = (): CustomDecorator<typeof AUTH_REALM> =>
	SetMetadata(AUTH_REALM, 'platform');

/**
 * Marks a controller or route as belonging to the Storefront authentication realm.
 * Storefront routes are for end-customers shopping on a Ferrite-powered storefront,
 * authenticated via lightweight session tokens scoped to a single store.
 */
export const StorefrontRoute = (): CustomDecorator<typeof AUTH_REALM> =>
	SetMetadata(AUTH_REALM, 'storefront');
