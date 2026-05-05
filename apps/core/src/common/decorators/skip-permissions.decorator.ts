import { type CustomDecorator, SetMetadata } from '@nestjs/common';

/**
 * Marks a route as intentionally exempt from store-scoped permission checks.
 *
 * Use this on authenticated routes that don't operate within a specific store
 * context (e.g. creating a new store, listing own stores). The route is still
 * protected by the AuthGuard — only the StorePermissionGuard step is skipped.
 *
 * This is distinct from @PublicRoute(), which bypasses authentication entirely.
 */
export const SKIP_PERMISSIONS = Symbol('SKIP_PERMISSIONS');

export const SkipPermissions = (): CustomDecorator<typeof SKIP_PERMISSIONS> =>
	SetMetadata(SKIP_PERMISSIONS, true);
