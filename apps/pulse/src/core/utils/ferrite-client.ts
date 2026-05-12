import { FerriteClient } from '@ferrite/api';

const BASE_URL = process.env.NEXT_PUBLIC_FERRITE_API_URL;
const VERSION = process.env.NEXT_PUBLIC_FERRITE_API_VERSION;

if (!BASE_URL) {
	throw new Error('NEXT_PUBLIC_FERRITE_API_URL is not defined');
}

if (!VERSION) {
	throw new Error('NEXT_PUBLIC_FERRITE_API_VERSION is not defined');
}

export const getFerriteClient = (getToken: () => Promise<string | null>) =>
	new FerriteClient({
		baseURL: BASE_URL,
		version: VERSION,
		getToken,
	});
