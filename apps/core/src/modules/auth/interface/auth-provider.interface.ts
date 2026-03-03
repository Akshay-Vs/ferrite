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

// type guard helper
export function isSessionProvider(
	provider: IAuthProvider
): provider is IAuthProvider & ISessionProvider {
	return 'getSession' in provider;
}

export const AUTH_PROVIDER = Symbol('AUTH_PROVIDER');
