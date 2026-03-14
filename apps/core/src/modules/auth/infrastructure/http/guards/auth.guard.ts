import { AuthenticatedRequest, Request } from '@common/types/request';
import { withSpan } from '@common/utils/tracing.util';
import { AppLogger } from '@core/logger/logger.service';
import { JwtTokenUseCase } from '@modules/auth/application/use-cases/jwt-token.usecase';
import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_ROUTE } from '../decorators/public-route.decorator';
import { IS_WEBHOOK_ROUTE } from '../decorators/webhook-route.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly logger: AppLogger,
		private readonly reflector: Reflector,
		private readonly verifyToken: JwtTokenUseCase
	) {
		this.logger.setContext(AuthGuard.name);
	}

	private extractToken(request: Request): string | null {
		const [type, token] = request.headers?.authorization?.split(' ') ?? [];

		this.logger.debug(`Extracted token type: ${type}`);
		return type === 'Bearer' ? token : null;
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		return withSpan('guards.auth.canActivate', async (span) => {
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

			(request as AuthenticatedRequest).authUser = authUser.value;
			return true;
		});
	}
}
