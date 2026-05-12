import type { AxiosRequestConfig } from 'axios';

export interface FerriteApiConfig {
	/** Absolute base URL of the Ferrite backend (e.g. `https://api.ferrite.dev`) */
	baseURL: string;

	/**
	 * The API version to prefix to all requests. Defaults to 'v1'.
	 */
	version?: string;

	/**
	 * Asynchronous accessor for the current Bearer token.
	 * Called before every request. By using a Promise, you can directly pass
	 * Clerk's `getToken()` function, which automatically handles token refreshing
	 * and caching under the hood before resolving the string.
	 *
	 * Return `null` to skip the Authorization header.
	 */
	getToken: () => Promise<string | null>;

	/** Extra Axios defaults (timeout, headers, etc.) */
	axiosDefaults?: Omit<AxiosRequestConfig, 'baseURL'>;
}
