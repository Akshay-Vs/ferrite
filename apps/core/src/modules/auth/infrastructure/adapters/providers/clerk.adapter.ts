import {
	ClerkClient,
	verifyToken as clerkVerifyToken,
	createClerkClient,
	WebhookEvent,
} from '@clerk/backend';
import { err, ok, Result } from '@common/interfaces/result.interface';
import { GENERATE_USER_ID } from '@common/providers/generate-user-id.provider';
import { RawWebhookRequest } from '@common/types/webhook-payload.type';
import { type GenerateUserId } from '@common/utils/generate-user-id.util';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import {
	AuthUser,
	authProvidersEnum,
	RawTokenClaims,
} from '@ferrite/schema/auth/index';
import { UserUpdatePayload } from '@ferrite/schema/auth/user-update-payload.zodschema';
import {
	WebhookEnvelope,
	webhookEnvelopeSchema,
} from '@ferrite/schema/common/webhook-envelope.zodschema';
import { DeleteUserError } from '@modules/auth/domain/errors/delete-user.error';
import { InvalidTokenError } from '@modules/auth/domain/errors/invalid-token.error';
import { InvalidWebhookPayloadError } from '@modules/auth/domain/errors/invalid-webhook-payload.error';
import { UpdateUserError } from '@modules/auth/domain/errors/update-user.error';
import { WebhookVerificationError } from '@modules/auth/domain/errors/webhook-verification.error';
import {
	IDeleteUser,
	ITokenAuth,
	IUpdateUser,
	IWebhookAuth,
} from '@modules/auth/domain/ports/auth-provider.port';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { USER_SYNC_QUEUE } from '@users/index';
import { Webhook } from 'svix';

export const CLERK_CLIENT = Symbol('CLERK_CLIENT');

@Injectable()
export class ClerkAdapter
	implements ITokenAuth, IWebhookAuth, IDeleteUser, IUpdateUser
{
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
	async verifyJWT(
		token: string
	): Promise<Result<RawTokenClaims, InvalidTokenError>> {
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
					return err(new InvalidTokenError('Invalid or expired token'));
				}

				return ok({
					sub: claims.sub,
					email: claims.email as string,
					email_verified: (claims.email_verified as boolean) ?? false,
					full_name: claims.full_name as string | undefined,
					metadata: (claims.public_metadata as Record<string, unknown>) ?? {},
					iat: claims.iat,
					exp: claims.exp,
				});
			} catch {
				this.logger.error('Invalid or expired token');
				return err(new InvalidTokenError('Invalid or expired token'));
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
	private zodParse(claims: WebhookEnvelope): any {
		return webhookEnvelopeSchema.parse(claims);
	}

	//  IWebhookVerifier
	async verifyWebhook(
		payload: RawWebhookRequest
	): Promise<
		Result<
			WebhookEnvelope,
			InvalidWebhookPayloadError | WebhookVerificationError
		>
	> {
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
					return err(
						new InvalidWebhookPayloadError(
							'Missing svix headers: svix-id, svix-timestamp, svix-signature are required'
						)
					);
				}
				if (!body) {
					this.logger.error('Missing request body');
					return err(new InvalidWebhookPayloadError('Missing request body'));
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
					return err(
						new WebhookVerificationError(
							'Webhook signature verification failed'
						)
					);
				}

				const parsedTimestamp = Number(svixTimestamp);
				if (Number.isNaN(parsedTimestamp)) {
					this.logger.error(
						'Invalid svix-timestamp header: not a valid number'
					);
					return err(
						new InvalidWebhookPayloadError('Invalid svix-timestamp header')
					);
				}

				try {
					const parsed = this.zodParse({
						provider: authProvidersEnum.clerk,
						eventId: svixId,
						eventType: verified.type,
						timestamp: parsedTimestamp,
						payload: (verified as any).data,
						queueName: USER_SYNC_QUEUE,
					});

					return ok(parsed);
				} catch (error) {
					this.logger.error(
						`Webhook payload schema validation failed: ${error}`
					);
					return err(
						new InvalidWebhookPayloadError(
							'Webhook payload failed schema validation'
						)
					);
				}
			}
		);
	}

	async deleteUser(
		externalAuthId: string
	): Promise<Result<void, DeleteUserError>> {
		return this.tracer.withSpan('adapters.clerk.deleteUser', async (_span) => {
			try {
				await this.clerkClient.users.deleteUser(externalAuthId);
				return ok();
			} catch (error) {
				this.logger.error(`Failed to delete user in Clerk: ${error}`);
				return err(
					new DeleteUserError(`Failed to delete user in Clerk: ${error}`)
				);
			}
		});
	}

	async updateUser(
		externalAuthId: string,
		payload: UserUpdatePayload
	): Promise<Result<void, UpdateUserError>> {
		return this.tracer.withSpan('adapters.clerk.updateUser', async (_span) => {
			try {
				const clerkPayload: {
					firstName?: string;
					lastName?: string;
					publicMetadata?: { role?: string; onBoardingState?: string };
				} = {};

				if (payload.firstName !== undefined) {
					clerkPayload.firstName = payload.firstName;
				}

				if (payload.lastName !== undefined) {
					clerkPayload.lastName = payload.lastName;
				}

				if (
					payload.publicMetadata?.role !== undefined ||
					payload.publicMetadata?.onBoardingState !== undefined
				) {
					clerkPayload.publicMetadata = {
						...(payload.publicMetadata.role !== undefined && {
							role: payload.publicMetadata.role,
						}),
						...(payload.publicMetadata.onBoardingState !== undefined && {
							onBoardingState: payload.publicMetadata.onBoardingState,
						}),
					};
				}

				await this.clerkClient.users.updateUser(externalAuthId, clerkPayload);
				return ok();
			} catch (error) {
				this.logger.error(`Failed to update user in Clerk: ${error}`);
				return err(
					new UpdateUserError(`Failed to update user in Clerk: ${error}`)
				);
			}
		});
	}
}
