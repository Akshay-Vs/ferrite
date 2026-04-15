import { PERMISSIONS_KEY } from '@common/decorators/require-permission.decorator';
import type { PermissionKey } from '@common/schemas/permissions.zodschema';
import { AuthenticatedRequest } from '@common/types/request';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { CheckStorePermissionUseCase } from '@modules/store/application/use-cases/check-store-permission.usecase';
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
		private readonly checkPermission: CheckStorePermissionUseCase,
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

				// 1. Read decorator metadata
				const requiredPermissions = this.reflector.getAllAndOverride<
					PermissionKey[]
				>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

				if (!requiredPermissions || requiredPermissions.length === 0) {
					this.logger.debug('No required permissions, bypassing guard');
					return true;
				}

				// 2. Ensure authenticated user
				const authUser = request.authUser;

				if (!authUser) {
					this.logger.debug('User is not authenticated');
					throw new UnauthorizedException('User is not authenticated');
				}

				// 3. Extract storeId from route params
				const storeId = request.params?.storeId as string | undefined;

				if (!storeId) {
					this.logger.warn(
						'Route requires @RequirePermission but has no :storeId param'
					);
					throw new ForbiddenException(
						'Missing store context for permission check'
					);
				}

				// 4. Execute permission check
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
