import {
	AuthUser,
	authProvidersEnum,
	RawTokenClaims,
	RawWebhookClaims,
} from '@auth/domain/schemas';
import { rawWebhookClaimsSchema } from '@auth/domain/schemas/webhook-claims.zodschema';
import { verifyToken as clerkVerifyToken, WebhookEvent } from '@clerk/backend';
import { WebhookPayload } from '@common/types/webhook-payload.type';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constrain';
import {
	ITokenAuth,
	IWebhookAuth,
} from '@modules/auth/domain/ports/auth-provider.port';
import {
	BadRequestException,
	Inject,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Webhook } from 'svix';

export const CLERK_CLIENT = Symbol('CLERK_CLIENT');

@Injectable()
export class ClerkAdapter implements ITokenAuth, IWebhookAuth {
	private readonly secretKey: string;

	constructor(
		private config: ConfigService,
		private logger: AppLogger,
		@Inject(OTEL_TRACER) private tracer: ITracer
	) {
		this.logger.setContext(ClerkAdapter.name);
		this.secretKey = this.config.getOrThrow<string>('AUTH_CLERK_SECRET_KEY');
	}

	//  ITokenVerifier
	async verifyJWT(token: string): Promise<RawTokenClaims> {
		return this.tracer.withSpan('adapters.clerk.verifyJWT', async (span) => {
			try {
				this.logger.debug('Verifying JWT token');

				span.setAttributes({
					'adapter.name': 'ClerkAdapter',
					'adapter.method': 'verifyJWT',
				});

				const claims = await clerkVerifyToken(token, {
					secretKey: this.secretKey,
				});

				if (!claims.email) {
					throw new UnauthorizedException('Invalid or expired token');
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
		});
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
			provider: authProvidersEnum.clerk,
		};
	}

	//IWebhookParser
	private zodParse(claims: RawWebhookClaims): any {
		return rawWebhookClaimsSchema.parse(claims);
	}

	//  IWebhookVerifier
	async verifyWebhook(payload: WebhookPayload): Promise<RawWebhookClaims> {
		return this.tracer.withSpan(
			'adapters.clerk.verifyWebhook',
			async (span) => {
				span.setAttributes({
					'adapter.name': 'ClerkAdapter',
					'adapter.method': 'verifyWebhook',
					'adapter.type': 'webhook',
				});

				const webhookSecret = this.config.getOrThrow<string>(
					'AUTH_CLERK_WEBHOOK_SECRET'
				);

				const { body, headers } = payload;

				const normalizeHeader = (value: unknown): string | null =>
					typeof value === 'string' && value.trim().length > 0 ? value : null;

				const svixId = normalizeHeader(headers['svix-id']);
				const svixTimestamp = normalizeHeader(headers['svix-timestamp']);
				const svixSignature = normalizeHeader(headers['svix-signature']);

				if (!svixId || !svixTimestamp || !svixSignature) {
					this.logger.error(
						'Missing svix headers: svix-id, svix-timestamp, svix-signature are required'
					);
					throw new BadRequestException(
						'Missing svix headers: svix-id, svix-timestamp, svix-signature are required'
					);
				}
				if (!body) {
					console.log('trigger');
					this.logger.error('Missing request body');
					throw new BadRequestException('Missing request body');
				}

				const wh = new Webhook(webhookSecret);

				try {
					// raw Buffer — exact bytes Clerk signed
					const verified = wh.verify(JSON.stringify(body), {
						'svix-id': svixId,
						'svix-timestamp': svixTimestamp,
						'svix-signature': svixSignature,
					}) as WebhookEvent;

					this.logger.debug(
						`Webhook signature verification successful: svixId=${svixId} eventType=${verified.type}`
					);

					const parsed = this.zodParse({
						eventId: svixId,
						eventType: verified.type as RawWebhookClaims['eventType'],
						timestamp: Number(svixTimestamp),
						data: (verified as any).data,
					});

					return parsed;
				} catch (error) {
					this.logger.error(`Webhook signature verification failed: ${error}`);
					throw new UnauthorizedException(
						'Webhook signature verification failed'
					);
				}
			}
		);
	}
}
