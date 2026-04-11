import { ROLES_KEY } from '@common/decorators/require-role.decorator';
import {
	platformRoleSchema,
	ROLE_HIERARCHY,
} from '@common/schemas/platform-roles.zodschema';
import { AuthenticatedRequest } from '@common/types/request';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Inject,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { z } from 'zod';

@Injectable()
export class PlatformRBACGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly logger: AppLogger,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer
	) {
		this.logger.setContext(PlatformRBACGuard.name);
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		return this.tracer.withSpan(
			'guards.platform_rbac.canActivate',
			async (span) => {
				this.logger.debug('PlatformRBACGuard.canActivate');

				const request = context
					.switchToHttp()
					.getRequest<AuthenticatedRequest>();

				span.setAttributes({
					'guard.name': 'PlatformRBACGuard',
					'http.route': request.route?.path ?? 'unknown',
				});

				const requiredRoles = this.reflector.getAllAndOverride<string[]>(
					ROLES_KEY,
					[context.getHandler(), context.getClass()]
				);

				if (!requiredRoles || requiredRoles.length === 0) {
					this.logger.debug('No required roles, bypassing guard');
					return true;
				}

				const authUser = request.authUser;

				if (!authUser) {
					this.logger.debug('User is not authenticated');
					throw new UnauthorizedException('User is not authenticated');
				}

				if (!authUser.role) {
					this.logger.debug('User does not have any roles assigned');
					throw new ForbiddenException('User does not have any roles assigned');
				}

				const parsedRoleResult = platformRoleSchema.safeParse(authUser.role);
				if (!parsedRoleResult.success) {
					this.logger.structured(
						'error',
						`Invalid role assigned to user: ${authUser.role}`,
						{
							errors: z.treeifyError(parsedRoleResult.error),
						}
					);
					throw new ForbiddenException('User has an invalid role');
				}

				const userRole = parsedRoleResult.data;
				const userRoleWeight = ROLE_HIERARCHY[userRole];

				const hasAccess = requiredRoles.some((requiredRoleStr) => {
					const requiredRoleParsed =
						platformRoleSchema.safeParse(requiredRoleStr);
					if (!requiredRoleParsed.success) {
						this.logger.warn(
							`Invalid required role in decorator: ${requiredRoleStr}`
						);
						return false;
					}
					const requiredRoleWeight = ROLE_HIERARCHY[requiredRoleParsed.data];
					return userRoleWeight >= requiredRoleWeight;
				});

				if (!hasAccess) {
					this.logger.debug(
						`User role ${userRole} (weight ${userRoleWeight}) does not satisfy required roles [${requiredRoles.join(', ')}]`
					);
					throw new ForbiddenException(
						'User does not have the required role hierarchy'
					);
				}

				this.logger.debug(
					`Request ${request.path} authorized. Role ${userRole} satisfied hierarchy.`
				);
				return true;
			}
		);
	}
}
