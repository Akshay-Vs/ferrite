import type { AuthUser } from '@auth/domain/schemas/auth-user.zodschema';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Parameter decorator that extracts the authenticated user from the request.
 *
 * The `AuthGuard` must run before this decorator — it attaches the verified
 * `authUser` object to `request.authUser`.
 *
 * @example
 * ```ts
 * @Get('me')
 * getMe(@AuthUserParam() user: AuthUser) { … }
 * ```
 */
export const AuthUserParam = createParamDecorator(
	(_data: unknown, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest();
		return request.authUser as AuthUser;
	}
);
