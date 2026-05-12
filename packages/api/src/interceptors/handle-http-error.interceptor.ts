import axios from 'axios';
import { ApiTransportError, AuthSessionError } from '../errors';

/**
 * Transforms raw Axios errors into strictly typed domain errors without retrying.
 * 401 Unauthorized → AuthSessionError (Signals the app to log the user out / redirect)
 * All other failures → ApiTransportError
 */
export function handleHttpErrorInterceptor() {
	return (error: unknown) => {
		if (!axios.isAxiosError(error)) {
			return Promise.reject(
				new ApiTransportError('Unknown transport error', error)
			);
		}

		const status = error.response?.status;

		if (status === 401) {
			return Promise.reject(
				new AuthSessionError('Authentication session expired or invalid', error)
			);
		}

		return Promise.reject(
			new ApiTransportError(
				error.message ?? `HTTP ${status ?? 'error'}`,
				error,
				status
			)
		);
	};
}
