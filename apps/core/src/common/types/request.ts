import { AuthUser } from '@ferrite/schema/auth/index';
import { WebhookEnvelope } from '@ferrite/schema/common/webhook-envelope.zodschema';
import { StorefrontUser } from '@ferrite/schema/storefront-auth/storefront-user.zodschema';
import { FastifyRequest } from 'fastify';

export interface Request extends FastifyRequest {
	rawBody: Buffer;
	params: Record<string, string | undefined>;
}

export interface PlatformAuthenticatedRequest extends Request {
	__authRealm: 'platform';
	authUser: AuthUser;
}

export interface StorefrontAuthenticatedRequest extends Request {
	__authRealm: 'storefront';
	storefrontUser: StorefrontUser;
}

export type AuthenticatedRequest =
	| PlatformAuthenticatedRequest
	| StorefrontAuthenticatedRequest;

export interface WebhookRequest extends Request {
	webhookPayload?: WebhookEnvelope;
}
