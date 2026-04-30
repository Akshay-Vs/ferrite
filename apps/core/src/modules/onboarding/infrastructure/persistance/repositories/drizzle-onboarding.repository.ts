import type { ITransactionContext } from '@common/interfaces/unit-of-work.interface';
import { DB } from '@core/database/db.provider';
import type { TDatabase } from '@core/database/db.type';
import { DrizzleUnitOfWork } from '@core/database/drizzle-unit-of-work';
import { userOnboarding } from '@core/database/schema';
import { traceDbOp } from '@core/database/utils/trace-db-op.util';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { Inject, Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import type { IOnboardingRepository } from '../../../domain/ports/onboarding-repository.port';
import type {
	OnboardingSession,
	OnboardingState,
} from '../../../domain/schemas/onboarding-state.zodschema';
import { OnboardingMapper } from '../mappers/onboarding.mapper';

@Injectable()
export class DrizzleOnboardingRepository implements IOnboardingRepository {
	constructor(
		@Inject(DB) private readonly db: TDatabase,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer
	) {}

	private getExecutor(tx?: ITransactionContext): TDatabase {
		if (tx) return DrizzleUnitOfWork.unwrap(tx) as unknown as TDatabase;
		return this.db;
	}

	async findByUserId(
		userId: string,
		tx?: ITransactionContext
	): Promise<OnboardingSession | null> {
		return traceDbOp(
			this.tracer,
			'db.userOnboarding.findByUserId',
			{ 'db.table': 'user_onboarding', 'db.operation': 'select' },
			async () => {
				const executor = this.getExecutor(tx);
				const [row] = await executor
					.select()
					.from(userOnboarding)
					.where(eq(userOnboarding.userId, userId))
					.limit(1);

				return row ? OnboardingMapper.toDomain(row) : null;
			}
		);
	}

	async upsert(
		userId: string,
		tx?: ITransactionContext
	): Promise<OnboardingSession> {
		return traceDbOp(
			this.tracer,
			'db.userOnboarding.upsert',
			{ 'db.table': 'user_onboarding', 'db.operation': 'upsert' },
			async () => {
				const executor = this.getExecutor(tx);
				const [row] = await executor
					.insert(userOnboarding)
					.values({ userId })
					.onConflictDoNothing({ target: userOnboarding.userId })
					.returning();

				// If the insert was a no-op (conflict), fetch the existing row
				if (!row) {
					const existing = await this.findByUserId(userId, tx);
					return existing!;
				}

				return OnboardingMapper.toDomain(row);
			}
		);
	}

	async updateState(
		userId: string,
		state: OnboardingState,
		tx?: ITransactionContext
	): Promise<void> {
		return traceDbOp(
			this.tracer,
			'db.userOnboarding.updateState',
			{ 'db.table': 'user_onboarding', 'db.operation': 'update' },
			async () => {
				const executor = this.getExecutor(tx);
				await executor
					.update(userOnboarding)
					.set({
						state,
						updatedAt: sql`CURRENT_TIMESTAMP`,
					})
					.where(eq(userOnboarding.userId, userId));
			}
		);
	}

	async markCompleted(userId: string, tx?: ITransactionContext): Promise<void> {
		return traceDbOp(
			this.tracer,
			'db.userOnboarding.markCompleted',
			{ 'db.table': 'user_onboarding', 'db.operation': 'update' },
			async () => {
				const executor = this.getExecutor(tx);
				await executor
					.update(userOnboarding)
					.set({
						isCompleted: true,
						completedAt: sql`CURRENT_TIMESTAMP`,
						updatedAt: sql`CURRENT_TIMESTAMP`,
					})
					.where(eq(userOnboarding.userId, userId));
			}
		);
	}
}
