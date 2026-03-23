import {
	AuthUser,
	authProvidersEnum,
	RawTokenClaims,
	WebhookPayload,
} from '@auth/domain/schemas';
import { webhookPayloadSchema } from '@auth/domain/schemas/webhook-claims.zodschema';
import {
	ClerkClient,
	verifyToken as clerkVerifyToken,
	createClerkClient,
	WebhookEvent,
} from '@clerk/backend';
import { GENERATE_USER_ID } from '@common/providers/generate-user-id.provider';
import { RawWebhookRequest } from '@common/types/webhook-payload.type';
import { type GenerateUserId } from '@common/utils/generate-user-id.util';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import {
	IDeleteUser,
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
export class ClerkAdapter implements ITokenAuth, IWebhookAuth, IDeleteUser {
	private readonly secretKey: string;
	private readonly publishableKey: string;
	private readonly clerkClient: ClerkClient;

	constructor(
		private readonly config: ConfigService,
		private readonly logger: AppLogger,

		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		@Inject(GENERATE_USER_ID) private readonly generateUserId: GenerateUserId
	) {
		this.logger.setContext(ClerkAdapter.name);
		this.secretKey = this.config.getOrThrow<string>('AUTH_CLERK_SECRET_KEY');
		this.publishableKey = this.config.getOrThrow<string>(
			'AUTH_CLERK_PUBLISHABLE_KEY'
		);

		this.clerkClient = createClerkClient({
			secretKey: this.secretKey,
			publishableKey: this.publishableKey,
		});
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
			id: this.generateUserId(claims.sub),
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
	private zodParse(claims: WebhookPayload): any {
		return webhookPayloadSchema.parse(claims);
	}

	//  IWebhookVerifier
	async verifyWebhook(payload: RawWebhookRequest): Promise<WebhookPayload> {
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
					this.logger.error('Missing request body');
					throw new BadRequestException('Missing request body');
				}

				const wh = new Webhook(webhookSecret);

				let verified: WebhookEvent;
				try {
					// raw Buffer — exact bytes Clerk signed
					verified = wh.verify(body, {
						'svix-id': svixId,
						'svix-timestamp': svixTimestamp,
						'svix-signature': svixSignature,
					}) as WebhookEvent;

					this.logger.debug(
						`Webhook signature verification successful: svixId=${svixId} eventType=${verified.type}`
					);
				} catch (error) {
					this.logger.error(`Webhook signature verification failed: ${error}`);
					throw new UnauthorizedException(
						'Webhook signature verification failed'
					);
				}

				const parsedTimestamp = Number(svixTimestamp);
				if (Number.isNaN(parsedTimestamp)) {
					this.logger.error(
						'Invalid svix-timestamp header: not a valid number'
					);
					throw new BadRequestException('Invalid svix-timestamp header');
				}

				try {
					const parsed = this.zodParse({
						provider: authProvidersEnum.clerk,
						eventId: svixId,
						eventType: verified.type,
						timestamp: parsedTimestamp,
						payload: (verified as any).data,
					});

					return parsed;
				} catch (error) {
					this.logger.error(
						`Webhook payload schema validation failed: ${error}`
					);
					throw new BadRequestException(
						'Webhook payload failed schema validation'
					);
				}
			}
		);
	}

	async deleteUser(externalAuthId: string): Promise<void> {
		return this.tracer.withSpan('adapters.clerk.deleteUser', async (_span) => {
			try {
				await this.clerkClient.users.deleteUser(externalAuthId);
			} catch (error) {
				this.logger.error(`Failed to delete user in Clerk: ${error}`);
				throw new Error(`Failed to delete user in Clerk: ${error}`);
			}
		});
	}
}
