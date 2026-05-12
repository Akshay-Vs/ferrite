import type { InternalAxiosRequestConfig } from 'axios';
import type { FerriteApiConfig } from '../interfaces';

export function injectAuthHeaderInterceptor(config: FerriteApiConfig) {
	return async (
		req: InternalAxiosRequestConfig
	): Promise<InternalAxiosRequestConfig> => {
		const token = await config.getToken();

		if (token) {
			req.headers = req.headers ?? {};
			req.headers['Authorization'] = `Bearer ${token}`;
		}

		return req;
	};
}
