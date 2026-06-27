/**
 * Uniform step discriminator returned by every Storefront Auth endpoint.
 * The frontend uses this field to decide which screen to render next.
 */
export enum AuthStep {
	/** Registration succeeded; user must verify their email before logging in. */
	EMAIL_VERIFICATION_REQUIRED = 'email_verification_required',
	/** Email verified successfully; no further action needed. */
	EMAIL_VERIFIED = 'email_verified',
	/** Credentials accepted but MFA code is still required. */
	MFA_REQUIRED = 'mfa_required',
	/** Auth complete — session created. */
	AUTHENTICATED = 'authenticated',
}
