import { IncomingHttpHeaders } from 'node:http';

/**
 * Raw HTTP envelope containing the unparsed body buffer and headers.
 */
export interface WebhookPayload {
	/**
	 * The raw HTTP envelope
	 */
	body: Buffer; // unparsed — required for signature verification
	headers: IncomingHttpHeaders;
}
