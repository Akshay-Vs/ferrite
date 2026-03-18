import { AuthProvider } from '@auth/index';
import { traceDbOp } from '@common/utils/trace-db-op.util';
import { DB } from '@core/database/db.provider';
import type { TDatabase } from '@core/database/db.type';
import { userAuthProviders } from '@core/database/schema/auth.schema';
import type { NewOutboxEvent } from '@core/database/schema/outbox.schema';
import { type User, users } from '@core/database/schema/user.schema';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import {
	type IOutboxRepository,
	OUTBOX_REPOSITORY,
} from '@modules/outbox/domain/ports/outbox-repository.port';
import { Inject, Injectable } from '@nestjs/common';
import type { IUserRepository } from '@users/domain/ports/user-repository.port';
import type { UpdateProfileInput } from '@users/domain/schemas/update-profile.zodschema';
import { UserCreatedEvent } from '@users/domain/schemas/user-created.zodschema';
import type { UserProfileFull } from '@users/domain/schemas/user-profile.zodschema';
import { UserUpdatedEvent } from '@users/domain/schemas/user-updated.zodschema';
import { and, eq, isNull } from 'drizzle-orm';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class DrizzleUserRepository implements IUserRepository {
	constructor(
		@Inject(DB) private readonly db: TDatabase,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		@Inject(OUTBOX_REPOSITORY) private readonly outboxRepo: IOutboxRepository
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
								userId: event.id,
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
				if (Object.keys(update).length === 0) return false;

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
		provider: AuthProvider
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
		provider: AuthProvider
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

	async findById(id: string): Promise<User | null> {
		return traceDbOp(
			this.tracer,
			'db.users.findById',
			{
				'db.table': 'users',
				'db.operation': 'select',
			},
			async () => {
				const [user] = await this.db
					.select()
					.from(users)
					.where(and(eq(users.id, id), isNull(users.deletedAt)))
					.limit(1);

				return user ?? null;
			}
		);
	}

	async updateProfileById(
		id: string,
		data: UpdateProfileInput,
		outboxEvent: Omit<NewOutboxEvent, 'id' | 'createdAt'>
	): Promise<UserProfileFull | null> {
		if (Object.keys(data).length === 0) return null;

		return traceDbOp(
			this.tracer,
			'db.users.updateProfileById',
			{
				'db.table': 'users,outbox_events',
				'db.operation': 'update',
			},
			async () => {
				return this.db.transaction(async (tx) => {
					// 1. Update user
					const result = await traceDbOp(
						this.tracer,
						'db.users.update',
						{ 'db.table': 'users', 'db.operation': 'update' },
						() =>
							tx
								.update(users)
								.set({
									...data,
									updatedAt: new Date(),
								})
								.where(and(eq(users.id, id), isNull(users.deletedAt)))
								.returning()
					);

					if (result.length === 0) return null;

					// 2. Insert outbox event
					await this.outboxRepo.insert(tx, outboxEvent);

					return UserMapper.toUserProfile(result[0]);
				});
			}
		);
	}
}
