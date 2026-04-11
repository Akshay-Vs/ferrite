import { AuthUser } from '@auth/domain/schemas';
import { WebhookEnvelope } from '@common/schemas/webhook-envelope.zodschema';
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
