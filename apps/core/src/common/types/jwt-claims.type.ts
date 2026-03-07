/**
 * Standard claims for JWT tokens
 */
export type JwtClaims = {
	/**
	 * Issuer of the token
	 */
	iss?: string;

	/**
	 * Subject identifier
	 */
	sub?: string;

	/**
	 * Intended audience
	 */
	aud?: string | string[];

	/**
	 * Expiration time (seconds since Unix epoch)
	 */
	exp?: number;

	/**
	 * Not valid before
	 */
	nbf?: number;

	/**
	 * Issued at
	 */
	iat?: number;

	/**
	 * Unique token identifier
	 */
	jti?: string;
};
