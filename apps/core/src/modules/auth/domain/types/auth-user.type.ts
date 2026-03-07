import { AuthProvider } from './auth-providers.enum';

/**
 * Application-level representation of an authenticated user (User Object).
 */
export interface AuthUser {
	externalAuthId: string;
	email: string;
	emailVerified: boolean;
	fullName?: string;
	role: string | null;
	metadata: Record<string, unknown>;
	provider: AuthProvider;
}
