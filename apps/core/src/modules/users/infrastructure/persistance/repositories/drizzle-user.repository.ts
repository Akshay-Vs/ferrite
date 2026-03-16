import { AuthProvider } from '@auth/index';
import { traceDbOp } from '@common/utils/trace-db-op.util';
import { DB } from '@core/database/db.provider';
import type { TDatabase } from '@core/database/db.type';
import { userAuthProviders } from '@core/database/schema/auth.schema';
import { users } from '@core/database/schema/user.schema';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constrain';
import { Inject, Injectable } from '@nestjs/common';
import type { IUserRepository } from '@users/domain/ports/user-repository.port';
import { UserCreatedEvent } from '@users/domain/schemas/user-created.zodschema';
import { UserUpdatedEvent } from '@users/domain/schemas/user-updated.zodschema';
import { and, eq } from 'drizzle-orm';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class DrizzleUserRepository implements IUserRepository {
	constructor(
		@Inject(DB) private readonly db: TDatabase,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer
	) {}

	async createWithAuth(event: UserCreatedEvent): Promise<string> {
		return traceDbOp(
			this.tracer,
			'db.user.createWithAuth',
			{ 'db.table': 'users,user_auth_providers', 'db.operation': 'insert' },
			async () => {
				const newUser = UserMapper.toNewUser(event);

				return this.db.transaction(async (tx) => {
					//Span: insert user row
					const [inserted] = await traceDbOp(
						this.tracer,
						'db.users.insert',
						{ 'db.table': 'users', 'db.operation': 'insert' },
						() => tx.insert(users).values(newUser).returning({ id: users.id })
					);

					//Span: insert auth-provider row
					await traceDbOp(
						this.tracer,
						'db.userAuthProviders.insert',
						{
							'db.table': 'user_auth_providers',
							'db.operation': 'insert',
							'auth.provider': event.provider,
						},
						() =>
							tx.insert(userAuthProviders).values({
								userId: inserted.id,
								provider: event.provider,
								externalAuthId: event.externalAuthId,
								oauthProvider: event.oauthProvider,
								twoFactorEnabled: event.twoFactorEnabled,
							})
					);

					return inserted.id;
				});
			}
		);
	}

	async updateByExternalAuthId(event: UserUpdatedEvent): Promise<boolean> {
		return traceDbOp(
			this.tracer,
			'db.user.updateByExternalAuthId',
			{
				'db.table': 'users',
				'db.operation': 'update',
				'auth.provider': event.provider,
			},
			async () => {
				const userId = await this.findUserIdByExternalAuthId(
					event.externalAuthId,
					event.provider
				);

				if (!userId) return false;

				const update = UserMapper.toUserUpdate(event);
				if (Object.keys(update).length === 0) return true;

				const result = await traceDbOp(
					this.tracer,
					'db.users.update',
					{ 'db.table': 'users', 'db.operation': 'update' },
					() =>
						this.db
							.update(users)
							.set(update)
							.where(eq(users.id, userId))
							.returning({ id: users.id })
				);

				return result.length > 0;
			}
		);
	}

	async softDeleteByExternalAuthId(
		externalAuthId: string,
		provider: string
	): Promise<boolean> {
		return traceDbOp(
			this.tracer,
			'db.user.softDeleteByExternalAuthId',
			{
				'db.table': 'users',
				'db.operation': 'update',
				'auth.provider': provider,
			},
			async () => {
				const userId = await this.findUserIdByExternalAuthId(
					externalAuthId,
					provider
				);

				if (!userId) return false;

				const result = await traceDbOp(
					this.tracer,
					'db.users.softDelete',
					{ 'db.table': 'users', 'db.operation': 'update' },
					() =>
						this.db
							.update(users)
							.set({
								deletedAt: new Date(),
								isActive: false,
								updatedAt: new Date(),
							})
							.where(eq(users.id, userId))
							.returning({ id: users.id })
				);

				return result.length > 0;
			}
		);
	}

	async findUserIdByExternalAuthId(
		externalAuthId: string,
		provider: string
	): Promise<string | null> {
		return traceDbOp(
			this.tracer,
			'db.userAuthProviders.findByExternalAuthId',
			{
				'db.table': 'user_auth_providers',
				'db.operation': 'select',
				'auth.provider': provider,
			},
			async () => {
				const [row] = await this.db
					.select({ userId: userAuthProviders.userId })
					.from(userAuthProviders)
					.where(
						and(
							eq(userAuthProviders.externalAuthId, externalAuthId),
							eq(userAuthProviders.provider, provider as AuthProvider)
						)
					)
					.limit(1);

				return row?.userId ?? null;
			}
		);
	}
}
