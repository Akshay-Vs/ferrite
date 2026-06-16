import {
	type IJwtTokenUseCase,
	JWT_TOKEN_UC,
} from '@auth/domain/ports/use-case.port';
import { IS_PUBLIC_ROUTE } from '@common/decorators/public-route.decorator';
import { IS_WEBHOOK_ROUTE } from '@common/decorators/webhook-route.decorator';
import { PlatformAuthenticatedRequest, Request } from '@common/types/request';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';

import {
	CanActivate,
	ExecutionContext,
	Inject,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly logger: AppLogger,
		private readonly reflector: Reflector,
		@Inject(JWT_TOKEN_UC) private readonly verifyToken: IJwtTokenUseCase,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer
	) {
		this.logger.setContext(AuthGuard.name);
	}

	private extractToken(request: Request): string | null {
		const [type, token] = request.headers?.authorization?.split(' ') ?? [];

		this.logger.debug(`Extracted token type: ${type}`);
		return type === 'Bearer' ? token : null;
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		return this.tracer.withSpan('guards.auth.canActivate', async (span) => {
			this.logger.debug('AuthGuard.canActivate');

			const request: Request = context.switchToHttp().getRequest();

			span.setAttributes({
				'guard.name': 'AuthGuard',
				'http.route': request.route?.path ?? 'unknown',
			});

			const isPublic = this.reflector.getAllAndOverride<boolean>(
				IS_PUBLIC_ROUTE,
				[context.getHandler(), context.getClass()]
			);

			const isWebhook = this.reflector.getAllAndOverride<boolean>(
				IS_WEBHOOK_ROUTE,
				[context.getHandler(), context.getClass()]
			);

			if (isPublic) {
				this.logger.debug('Public endpoint, bypassing auth');
				return true;
			}

			if (isWebhook) {
				this.logger.debug('Webhook endpoint, bypassing JWT auth');
				return true;
			}

			const token = this.extractToken(request);

			if (!token) {
				this.logger.debug('No token provided, unauthorized');
				throw new UnauthorizedException('No token provided');
			}

			const authUser = await this.verifyToken.execute(token);

			if (authUser.isErr()) {
				this.logger.error(`Failed to verify token: ${authUser.error.message}`);
				throw new UnauthorizedException('Invalid or expired token');
			}

			this.logger.debug(`Request ${request.path} authorized`);

			const platformRequest = request as PlatformAuthenticatedRequest;
			platformRequest.authUser = authUser.value;
			platformRequest.__authRealm = 'platform';
			return true;
		});
	}
}
