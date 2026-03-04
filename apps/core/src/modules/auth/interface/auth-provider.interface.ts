export interface AuthUser {
	sid: string;
	externalAuthId: string;
	role: string | null;
	metadata: Record<string, unknown>;
	provider: string;
}

export interface AuthSession {
	id: string;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
	lastActiveAt: Date;
	expireAt: Date;
}

// base interface for all providers
export interface IAuthProvider {
	verifyToken(token: string): Promise<AuthUser>;
	revokeToken(token: string): Promise<void>;
}

// for providers that support sessions
export interface ISessionProvider {
	getSession(sid: string): Promise<AuthSession>;
}

/**
 * Type guard to check if a provider implements both IAuthProvider and ISessionProvider
 * @param provider The provider to check
 * @returns True if the provider implements both IAuthProvider and ISessionProvider, false otherwise
 */
export function isSessionProvider(
	provider: IAuthProvider
): provider is IAuthProvider & ISessionProvider {
	const partialProvider = provider as Partial<ISessionProvider>;
	return typeof partialProvider.getSession === 'function';
}

export const AUTH_PROVIDER = Symbol('AUTH_PROVIDER');
