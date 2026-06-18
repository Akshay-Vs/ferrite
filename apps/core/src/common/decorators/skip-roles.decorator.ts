import { type CustomDecorator, SetMetadata } from '@nestjs/common';

export const SKIP_ROLES = Symbol('SKIP_ROLES');

/**
 * Marks a route as intentionally exempt from platform-level role checks.
 *
 * Use this on specific routes within a controller that is protected by
 * PlatformRBACGuard, when those specific routes should be accessible to
 * any authenticated user regardless of their platform role.
 */
export const SkipRoles = (): CustomDecorator<typeof SKIP_ROLES> =>
	SetMetadata(SKIP_ROLES, true);
