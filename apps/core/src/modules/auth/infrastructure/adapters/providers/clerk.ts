import { verifyToken as clerkVerifyToken, WebhookEvent } from '@clerk/backend';
import { WebhookPayload } from '@common/types/webhook-payload.type';
import { AppLogger } from '@core/logger/logger.service';
import { IAuthAdapter } from '@modules/auth/domain/ports/auth-provider.port';
import { AuthProvider } from '@modules/auth/domain/types/auth-providers.enum';
import { AuthUser } from '@modules/auth/domain/types/auth-user.type';
import { RawTokenClaims } from '@modules/auth/domain/types/raw-token-claims.type';
import { RawWebhookClaims } from '@modules/auth/domain/types/raw-webhook-claims.type';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Webhook } from 'svix';

export const CLERK_CLIENT = Symbol('CLERK_CLIENT');

@Injectable()
export class ClerkAdapter implements IAuthAdapter {
	private readonly webhookSecret: string;
	private readonly secretKey: string;

	constructor(
		private config: ConfigService,
		private logger: AppLogger
	) {
		this.logger.setContext(ClerkAdapter.name);
		this.secretKey = this.config.getOrThrow<string>('AUTH_CLERK_SECRET_KEY');
		this.webhookSecret = this.config.getOrThrow<string>(
			'AUTH_CLERK_WEBHOOK_SECRET'
		);
	}

	//  ITokenVerifier
	async verifyJWT(token: string): Promise<RawTokenClaims> {
		try {
			this.logger.debug('Verifying JWT token');
			const claims = await clerkVerifyToken(token, {
				secretKey: this.secretKey,
			});

			if (!claims.email) {
				throw new Error('Invalid token claims');
			}

			return {
				sub: claims.sub,
				email: claims.email as string,
				email_verified: (claims.email_verified as boolean) ?? false,
				full_name: claims.full_name as string | undefined,
				metadata: (claims.public_metadata as Record<string, unknown>) ?? {},
				iat: claims.iat,
				exp: claims.exp,
			};
		} catch {
			this.logger.error('Invalid or expired token');
			throw new UnauthorizedException('Invalid or expired token');
		}
	}

	//  ITokenTransformer
	toAuthUser(claims: RawTokenClaims): AuthUser {
		return {
			externalAuthId: claims.sub,
			email: claims.email,
			emailVerified: claims.email_verified,
			fullName: claims.full_name,
			role: (claims.metadata?.role as string) ?? null,
			metadata: claims.metadata ?? {},
			provider: AuthProvider.CLERK,
		};
	}

	//  IWebhookVerifier
	async verifyWebhook(payload: WebhookPayload): Promise<RawWebhookClaims> {
		const { body, headers } = payload;

		const svixId = headers['svix-id'] as string | undefined;
		const svixTimestamp = headers['svix-timestamp'] as string | undefined;
		const svixSignature = headers['svix-signature'] as string | undefined;

		if (!svixId || !svixTimestamp || !svixSignature) {
			this.logger.error(
				'Missing svix headers: svix-id, svix-timestamp, svix-signature are required'
			);
			throw new Error(
				'Missing svix headers: svix-id, svix-timestamp, svix-signature are required'
			);
		}

		if (!body?.length) {
			this.logger.error('Missing request body');
			throw new Error('Missing request body');
		}

		const wh = new Webhook(this.webhookSecret);

		try {
			// raw Buffer — exact bytes Clerk signed
			const verified = wh.verify(body, {
				'svix-id': svixId,
				'svix-timestamp': svixTimestamp,
				'svix-signature': svixSignature,
			}) as WebhookEvent;

			this.logger.debug(
				'Webhook signature verification successful',
				JSON.stringify(verified, null, 2)
			);

			return {
				event_id: svixId,
				event_type: verified.type,
				timestamp: Number(svixTimestamp),
				data: (verified as any).data,
			};
		} catch (error) {
			this.logger.error('Webhook signature verification failed');
			throw new Error(
				`Webhook signature verification failed: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}
}
