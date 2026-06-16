import { AuthUser } from '@ferrite/schema/auth/index';
import { StorefrontUser } from '@ferrite/schema/auth/storefront-user.zodschema';
import { WebhookEnvelope } from '@ferrite/schema/common/webhook-envelope.zodschema';
import { Request as ExpressRequest } from 'express';

export interface Request extends ExpressRequest {
	rawBody: Buffer;
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
