/**
 * Raw claims returned by the webhook verifier.
 */
export interface RawWebhookClaims {
	event_id: string;
	event_type: string;
	timestamp: number;
	data: Record<string, unknown>;
}
