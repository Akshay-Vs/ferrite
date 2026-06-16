import { IS_PUBLIC_ROUTE } from '@common/decorators/public-route.decorator';
import { PERMISSIONS_KEY } from '@common/decorators/require-permission.decorator';
import { SKIP_PERMISSIONS } from '@common/decorators/skip-permissions.decorator';
import { Result } from '@common/interfaces/result.interface';
import {
	AuthenticatedRequest,
	PlatformAuthenticatedRequest,
} from '@common/types/request';
import { AppLogger } from '@core/logger/logger.service';
import { type ISpan, type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import type { PermissionKey } from '@ferrite/schema/common/permissions.zodschema';
import { uuidSchema } from '@ferrite/schema/common/uuid.zodschema';
import { PermissionNotProvidedError } from '@modules/store/domain/errors/permission-not-provided-error';
import {
	CHECK_STORE_PERMISSION_UC,
	type ICheckStorePermissionUseCase,
} from '@modules/store/domain/ports/role-use-cases.port';
import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Inject,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class StorePermissionGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly logger: AppLogger,
		@Inject(CHECK_STORE_PERMISSION_UC)
		private readonly checkPermission: ICheckStorePermissionUseCase,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer
	) {
		this.logger.setContext(this.constructor.name);
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		return this.tracer.withSpan(
			'guards.store_permission.canActivate',
			async (span) => {
				this.logger.debug('StorePermissionGuard.canActivate');

				const request = context
					.switchToHttp()
					.getRequest<AuthenticatedRequest>();

				this.setTraceAttributes(span, request);

				if (this.shouldShortCircuit(context)) {
					return true;
				}

				const requiredPermissions = this.getRequiredPermissions(context);
				const authUser = this.getAuthUser(request);
				const storeId = this.getValidStoreId(request);

				const result = await this.checkPermission.execute({
					userId: authUser.id,
					storeId,
					requiredPermissions,
				});

				this.handlePermissionResult(
					result,
					authUser.id,
					storeId,
					requiredPermissions
				);

				this.logger.debug(
					`Request ${request.path} authorized. User ${authUser.id} has permissions [${requiredPermissions.join(', ')}] in store ${storeId}.`
				);
				return true;
			}
		);
	}

	private shouldShortCircuit(context: ExecutionContext): boolean {
		// Short-circuit for public and permission-exempt routes
		const isPublic = this.reflector.getAllAndOverride<boolean>(
			IS_PUBLIC_ROUTE,
			[context.getHandler(), context.getClass()]
		);
		if (isPublic) {
			this.logger.debug('Public route — skipping permission check');
			return true;
		}

		const skipPermissions = this.reflector.getAllAndOverride<boolean>(
			SKIP_PERMISSIONS,
			[context.getHandler(), context.getClass()]
		);
		if (skipPermissions) {
			this.logger.debug('@SkipPermissions — skipping store permission check');
			return true;
		}

		return false;
	}

	private setTraceAttributes(span: ISpan, request: AuthenticatedRequest): void {
		span.setAttributes({
			'guard.name': 'StorePermissionGuard',
			'http.route': request.route?.path ?? 'unknown',
		});
	}

	private getRequiredPermissions(context: ExecutionContext): PermissionKey[] {
		const requiredPermissions = this.reflector.getAllAndOverride<
			PermissionKey[]
		>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

		if (!requiredPermissions || requiredPermissions.length === 0) {
			this.logger.debug('No permissions provided');
			throw new PermissionNotProvidedError();
		}
		return requiredPermissions;
	}

	private getAuthUser(
		request: AuthenticatedRequest
	): PlatformAuthenticatedRequest['authUser'] {
		const authUser = (request as PlatformAuthenticatedRequest).authUser;

		if (!authUser) {
			this.logger.debug('User is not authenticated');
			throw new UnauthorizedException('User is not authenticated');
		}
		return authUser;
	}

	private getValidStoreId(request: AuthenticatedRequest): string {
		const storeId = request.params?.storeId as string | undefined;

		if (!storeId) {
			this.logger.debug(
				'Route requires @RequirePermission but has no :storeId param'
			);
			throw new ForbiddenException('Store ID is not provided');
		}

		if (!uuidSchema.safeParse(storeId).success) {
			this.logger.debug(
				'Route requires @RequirePermission but has invalid :storeId param'
			);
			throw new ForbiddenException('Store ID is not a valid UUID');
		}
		return storeId;
	}

	private handlePermissionResult(
		result: Result<boolean, Error>,
		userId: string,
		storeId: string,
		requiredPermissions: PermissionKey[]
	): void {
		if (result.isErr()) {
			this.logger.debug(`User ${userId} is not a member of store ${storeId}`);
			throw new ForbiddenException('User is not a member of this store');
		}

		if (!result.value) {
			this.logger.debug(
				`User ${userId} lacks permissions [${requiredPermissions.join(', ')}] in store ${storeId}`
			);
			throw new ForbiddenException(
				'User does not have the required store permissions'
			);
		}
	}
}
