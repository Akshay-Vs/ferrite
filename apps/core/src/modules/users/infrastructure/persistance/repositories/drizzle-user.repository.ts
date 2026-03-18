import { AuthProvider } from '@auth/index';
import { traceDbOp } from '@common/utils/trace-db-op.util';
import { DB } from '@core/database/db.provider';
import type { TDatabase } from '@core/database/db.type';
import { userAuthProviders } from '@core/database/schema/auth.schema';
import { type NewOutboxEvent } from '@core/database/schema/outbox.schema';
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

					// 2. Write outbox event
					await traceDbOp(
						this.tracer,
						'db.outbox_events.insert',
						{ 'db.table': 'outbox_events', 'db.operation': 'insert' },
						() => this.outboxRepo.insert(tx, outboxEvent)
					);
					return UserMapper.toUserProfile(result[0]);
				});
			}
		);
	}

	async softDeleteById(
		id: string,
		provider: AuthProvider,
		outboxEvent: Omit<NewOutboxEvent, 'id' | 'createdAt'>
	): Promise<boolean> {
		return traceDbOp(
			this.tracer,
			'db.user.softDeleteByExternalAuthId',
			{
				'db.table': 'users,outbox_events',
				'db.operation': 'update',
				'auth.provider': provider,
			},
			async () => {
				const user = await this.findById(id);
				if (!user) return false;
				if (user.deletedAt) return false;

				return this.db.transaction(async (tx) => {
					// 1. Soft delete user
					const result = await traceDbOp(
						this.tracer,
						'db.users.softDelete',
						{ 'db.table': 'users', 'db.operation': 'update' },
						() =>
							tx
								.update(users)
								.set({
									deletedAt: new Date(),
									isActive: false,
									updatedAt: new Date(),
									email: `${user.email}.${user.id}.deleted`,
								})
								.where(eq(users.id, user.id))
								.returning({ id: users.id })
					);
					if (result.length === 0) return false;

					// 2. Write outbox event
					await traceDbOp(
						this.tracer,
						'db.outbox_events.insert',
						{ 'db.table': 'outbox_events', 'db.operation': 'insert' },
						() => this.outboxRepo.insert(tx, outboxEvent)
					);

					return true;
				});
			}
		);
	}
}
