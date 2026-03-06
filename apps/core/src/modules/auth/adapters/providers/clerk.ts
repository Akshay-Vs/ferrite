import {
	verifyToken as clerkVerifyToken,
	createClerkClient,
} from '@clerk/backend';
import { JwtPayload } from '@common/types/jwt-payload';
import { AppLogger } from '@core/logger/logger.service';
import {
	AuthSession,
	AuthUser,
	IAuthProvider,
	ISessionProvider,
	WebHookEvent,
	WebHookPayload,
} from '@modules/auth/domain/ports/auth-provider.port';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const CLERK_CLIENT = Symbol('CLERK_CLIENT');

interface ClerkTokenPayload extends JwtPayload {
	sid: string;
	metadata?: {
		role: string;
	};
}
@Injectable()
export class ClerkAuthAdapter implements IAuthProvider, ISessionProvider {
	constructor(
		@Inject(CLERK_CLIENT) private clerk: ReturnType<typeof createClerkClient>,
		private config: ConfigService,
		private logger: AppLogger
	) {}

	private async verify(token: string): Promise<ClerkTokenPayload> {
		try {
			const jwtKey = this.config.getOrThrow<string>('CLERK_JWT_KEY');
			return await clerkVerifyToken(token, { jwtKey });
		} catch (e) {
			this.logger.error(e);
			throw new Error('Invalid token');
		}
	}

	async verifyToken(token: string): Promise<AuthUser> {
		const session = await this.verify(token);

		return {
			sid: session.sid,
			externalAuthId: session.sub,
			role: session.metadata?.role ?? null, //? role enforcement is caller's responsibility
			metadata: session.metadata ?? {},
			provider: 'clerk',
		};
	}

	async revokeToken(token: string): Promise<void> {
		const { sid } = await this.verify(token);
		await this.clerk.sessions.revokeSession(sid);
	}

	async getSession(sid: string): Promise<AuthSession> {
		try {
			const session = await this.clerk.sessions.getSession(sid);

			return {
				id: session.id,
				userId: session.userId,
				createdAt: new Date(session.createdAt),
				updatedAt: new Date(session.updatedAt),
				lastActiveAt: new Date(session.lastActiveAt),
				expireAt: new Date(session.expireAt),
			};
		} catch (e: unknown) {
			const status =
				typeof e === 'object' && e !== null && 'status' in e
					? Number((e as { status?: number }).status)
					: undefined;

			if (status === 404) {
				this.logger.error(`Session not found: ${sid}`);
				throw new Error('Session not found');
			}

			this.logger.error(
				`Something went wrong: unable to fetch session: ${sid}`
			);
			throw new Error('Unable to fetch session');
		}
	}

	async verifyWebhook(payload: WebHookPayload): Promise<WebHookEvent> {
		throw new Error('Method not implemented.');
	}
}
