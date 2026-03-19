/**
 * Transport-agnostic header map.
 * Structurally compatible with Node `IncomingHttpHeaders` so that Express
 * request objects can be passed directly without conversion.
 */
export type WebhookHeaders = Record<string, string | string[] | undefined>;

/**
 * Raw HTTP envelope received by the webhook controller.
 * Must contain the unparsed body buffer — required for signature verification.
 * Parsing the body before verification will break HMAC signature checks.
 */
export interface RawWebhookRequest {
	/**
	 * Unparsed raw request body as a Buffer.
	 * Requires rawBody: true in NestJS bootstrap (main.ts):
	 * const app = await NestFactory.create(AppModule, { rawBody: true })
	 */
	body: Buffer;

	/**
	 * Raw HTTP request headers.
	 * Contains provider-specific signature headers:
	 * - Clerk:    svix-id, svix-timestamp, svix-signature
	 * - Firebase: N/A (uses JWT verification)
	 * - Kinde:    svix-id, svix-timestamp, svix-signature
	 */
	headers: WebhookHeaders;
}
