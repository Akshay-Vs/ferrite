import {
	WebhookEventType as ClerkWebhookEventType,
	verifyToken as clerkVerifyToken,
} from '@clerk/backend';
import { AppLogger } from '@core/logger/logger.service';
import { IAuthAdapter } from '@modules/auth/domain/ports/auth-provider.port';
import { AuthProvider } from '@modules/auth/domain/types/auth-providers.enum';
import { AuthUser } from '@modules/auth/domain/types/auth-user.type';
import { RawTokenClaims } from '@modules/auth/domain/types/raw-token-claims.type';
import { RawWebhookClaims } from '@modules/auth/domain/types/raw-webhook-claims.type';
import {
	UserWebhookEvent,
	WebhookEventType,
} from '@modules/auth/domain/types/webhook-event.type';
import { WebhookPayload } from '@modules/auth/domain/types/webhook-payload.type';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Webhook } from 'svix';

export const CLERK_CLIENT = Symbol('CLERK_CLIENT');

@Injectable()
export class ClerkAdapter implements IAuthAdapter {
	private readonly webhookSecret: string;
	private readonly secretKey: string;

	private CLERK_EVENT_MAP = {
		['user.created' satisfies ClerkWebhookEventType]:
			WebhookEventType.USER_CREATED,
		['user.updated' satisfies ClerkWebhookEventType]:
			WebhookEventType.USER_UPDATED,
		['user.deleted' satisfies ClerkWebhookEventType]:
			WebhookEventType.USER_DELETED,
	} satisfies Partial<Record<ClerkWebhookEventType, WebhookEventType>>;

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

	//  IWebhookVerifier

	async verifyWebhook(payload: WebhookPayload): Promise<RawWebhookClaims> {
		const wh = new Webhook(this.webhookSecret);

		try {
			this.logger.debug('Verifying webhook payload');

			const raw = wh.verify(payload.body, {
				'svix-id': payload.headers['svix-id'],
				'svix-timestamp': payload.headers['svix-timestamp'],
				'svix-signature': payload.headers['svix-signature'],
			}) as Record<string, unknown>;

			const eventType = this.mapEventType(raw.type as ClerkWebhookEventType);

			return {
				event_id: payload.headers['svix-id'],
				event_type: eventType,
				timestamp: Number(payload.headers['svix-timestamp']),
				data: raw.data as Record<string, unknown>,
			};
		} catch {
			this.logger.error('Invalid webhook signature');
			throw new UnauthorizedException('Invalid webhook signature');
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

	//  IWebhookTransformer

	toWebhookEvent(raw: RawWebhookClaims): UserWebhookEvent {
		const type = this.mapEventType(raw.event_type);
		const data = raw.data;

		return {
			eventId: raw.event_id,
			type,
			timestamp: new Date(raw.timestamp),
			provider: AuthProvider.CLERK,
			userId: data.id as string,
			user: {
				email: (data.email_addresses as any[])?.[0]?.email_address ?? '',
				emailVerified:
					(data.email_addresses as any[])?.[0]?.verification?.status ===
					'verified',
				phone: (data.phone_numbers as any[])?.[0]?.phone_number,
				firstName: data.first_name as string | undefined,
				lastName: data.last_name as string | undefined,
				avatarUrl: data.image_url as string | undefined,
				metadata: (data.public_metadata as Record<string, unknown>) ?? {},
			},
		};
	}

	//  Helpers
	private mapEventType(raw: ClerkWebhookEventType): WebhookEventType {
		const eventType = this.CLERK_EVENT_MAP[raw as ClerkWebhookEventType];

		if (!eventType) {
			throw new Error(`Unrecognised Clerk webhook event type: "${raw}"`);
		}
		return eventType;
	}
}
