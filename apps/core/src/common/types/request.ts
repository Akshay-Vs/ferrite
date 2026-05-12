import { AuthUser } from '@ferrite/schema/auth/index';
import { WebhookEnvelope } from '@ferrite/schema/common/webhook-envelope.zodschema';
import { Request as ExpressRequest } from 'express';

export interface Request extends ExpressRequest {
	rawBody: Buffer;
}

export interface AuthenticatedRequest extends Request {
	authUser: AuthUser;
}

export interface WebhookRequest extends Request {
	webhookPayload?: WebhookEnvelope;
}
