import { IS_PUBLIC_ROUTE } from '@common/decorators/public-route.decorator';
import { PERMISSIONS_KEY } from '@common/decorators/require-permission.decorator';
import { SKIP_PERMISSIONS } from '@common/decorators/skip-permissions.decorator';
import { AuthenticatedRequest } from '@common/types/request';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
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

				span.setAttributes({
					'guard.name': 'StorePermissionGuard',
					'http.route': request.route?.path ?? 'unknown',
				});

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
					this.logger.debug(
						'@SkipPermissions — skipping store permission check'
					);
					return true;
				}

				// Read decorator metadata
				const requiredPermissions = this.reflector.getAllAndOverride<
					PermissionKey[]
				>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

				if (!requiredPermissions || requiredPermissions.length === 0) {
					this.logger.debug('No permissions provided');
					throw new PermissionNotProvidedError();
				}

				// Ensure authenticated user
				const authUser = request.authUser;

				if (!authUser) {
					this.logger.debug('User is not authenticated');
					throw new UnauthorizedException('User is not authenticated');
				}

				//. Extract storeId from route params
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

				// Execute permission check
				const result = await this.checkPermission.execute({
					userId: authUser.id,
					storeId,
					requiredPermissions,
				});

				if (result.isErr()) {
					this.logger.debug(
						`User ${authUser.id} is not a member of store ${storeId}`
					);
					throw new ForbiddenException('User is not a member of this store');
				}

				if (!result.value) {
					this.logger.debug(
						`User ${authUser.id} lacks permissions [${requiredPermissions.join(', ')}] in store ${storeId}`
					);
					throw new ForbiddenException(
						'User does not have the required store permissions'
					);
				}

				this.logger.debug(
					`Request ${request.path} authorized. User ${authUser.id} has permissions [${requiredPermissions.join(', ')}] in store ${storeId}.`
				);
				return true;
			}
		);
	}
}
