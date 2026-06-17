import { IS_PUBLIC_ROUTE } from '@common/decorators/public-route.decorator';
import { ROLES_KEY } from '@common/decorators/require-role.decorator';
import { SKIP_ROLES } from '@common/decorators/skip-roles.decorator';
import { IS_WEBHOOK_ROUTE } from '@common/decorators/webhook-route.decorator';
import {
	AuthenticatedRequest,
	PlatformAuthenticatedRequest,
} from '@common/types/request';
import { AppLogger } from '@core/logger/logger.service';
import { type ISpan, type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import {
	PlatformRoles,
	platformRoleSchema,
	ROLE_HIERARCHY,
} from '@ferrite/schema/common/platform-roles.zodschema';
import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Inject,
	Injectable,
	InternalServerErrorException,
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

				this.setTraceAttributes(span, request);

				if (this.shouldShortCircuit(context)) {
					return true;
				}

				const requiredRoles = this.getRequiredRoles(context, request);
				const authUser = this.getAuthUser(request);
				const userRole = this.checkUserRoleHierarchy(authUser, requiredRoles);

				this.logger.debug(
					`Request ${request.url} authorized. Role ${userRole} satisfied hierarchy.`
				);
				return true;
			}
		);
	}

	private setTraceAttributes(span: ISpan, request: AuthenticatedRequest): void {
		span.setAttributes({
			'guard.name': 'PlatformRBACGuard',
			'http.route': request.routeOptions.url ?? 'unknown',
		});
	}

	private shouldShortCircuit(context: ExecutionContext): boolean {
		const targets = [context.getHandler(), context.getClass()];

		// Short-circuit: public routes bypass RBAC entirely
		const isPublic = this.reflector.getAllAndOverride<boolean>(
			IS_PUBLIC_ROUTE,
			targets
		);
		if (isPublic) {
			this.logger.debug('Public route — skipping RBAC check');
			return true;
		}

		// Short-circuit: webhook routes have their own auth pipeline
		const isWebhook = this.reflector.getAllAndOverride<boolean>(
			IS_WEBHOOK_ROUTE,
			targets
		);
		if (isWebhook) {
			this.logger.debug('Webhook route — skipping RBAC check');
			return true;
		}

		// Short-circuit: explicitly opted out of platform RBAC
		const skipRoles = this.reflector.getAllAndOverride<boolean>(
			SKIP_ROLES,
			targets
		);
		if (skipRoles) {
			this.logger.debug('@SkipRoles — skipping platform RBAC check');
			return true;
		}

		return false;
	}

	private getRequiredRoles(
		context: ExecutionContext,
		request: AuthenticatedRequest
	): string[] {
		const requiredRoles = this.reflector.getAllAndOverride<string[]>(
			ROLES_KEY,
			[context.getHandler(), context.getClass()]
		);

		// FAIL-CLOSE: Guard applied but no roles declared
		// → developer forgot to annotate this route with @RequireRole()
		if (!requiredRoles || requiredRoles.length === 0) {
			this.logger.error(
				`Route ${request.routeOptions.url ?? 'unknown'} has PlatformRBACGuard but no @RequireRole(). ` +
					'Add @RequireRole() or remove the guard.'
			);
			throw new InternalServerErrorException(
				'Route has no platform role policy declared. Add @RequireRole() or remove the guard.'
			);
		}

		return requiredRoles;
	}

	private getAuthUser(
		request: AuthenticatedRequest
	): PlatformAuthenticatedRequest['authUser'] {
		const authUser = (request as PlatformAuthenticatedRequest).authUser;

		// Ensure this is a platform request before checking roles
		if (!authUser) {
			this.logger.error(
				'No authUser found on request, but PlatformRBACGuard is active'
			);
			throw new UnauthorizedException('Authentication required');
		}

		return authUser;
	}

	private checkUserRoleHierarchy(
		authUser: PlatformAuthenticatedRequest['authUser'],
		requiredRoles: string[]
	): string {
		if (!authUser.role && !requiredRoles.includes(PlatformRoles.USER)) {
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
			const requiredRoleParsed = platformRoleSchema.safeParse(requiredRoleStr);
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

		return userRole;
	}
}
