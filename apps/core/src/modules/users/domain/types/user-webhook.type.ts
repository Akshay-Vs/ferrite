export enum WebhookEventType {
	USER_CREATED = 'user.created',
	USER_UPDATED = 'user.updated',
	USER_DELETED = 'user.deleted',
}

/**
 * Application-level representation of a verified user webhook event (Webhook Event Object).
 */
export interface UserWebhookEvent {
	eventId: string;
	type: WebhookEventType;
	timestamp: Date;
	userId: string;
	user: {
		email: string;
		emailVerified: boolean;
		phone?: string;
		firstName?: string;
		lastName?: string;
		avatarUrl?: string;
		metadata: Record<string, unknown>;
	};
}
