import { AuthUser, WebhookPayload } from '@auth/domain/schemas';
import { Request as ExpressRequest } from 'express';

export interface Request extends ExpressRequest {
	authUser?: AuthUser;
}

export interface AuthenticatedRequest extends Request {
	authUser: AuthUser;
}

export interface WebhookRequest extends Request {
	webhookPayload?: WebhookPayload;
}
