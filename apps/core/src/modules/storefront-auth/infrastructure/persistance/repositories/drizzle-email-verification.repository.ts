import {
	type ITransactionContext,
	type IUnitOfWork,
	UNIT_OF_WORK,
} from '@common/interfaces/unit-of-work.interface';
import { DB } from '@core/database/db.provider';
import type { TDatabase } from '@core/database/db.type';
import { DrizzleUnitOfWork } from '@core/database/drizzle-unit-of-work';
import { storefrontEmailVerifications } from '@core/database/schema/storefront-user.schema';
import { traceDbOp } from '@core/database/utils/trace-db-op.util';
import type { ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import type {
	CreateEmailVerificationInput,
	EmailVerification,
} from '@ferrite/schema/storefront-auth/email-verification.zodschema';
import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, gt } from 'drizzle-orm';
import type { IStorefrontEmailVerificationRepository } from '../../../domain/ports/email-verification-repository.port';
import { EmailVerificationMapper } from '../mappers/email-verification.mapper';

@Injectable()
export class DrizzleEmailVerificationRepository
	implements IStorefrontEmailVerificationRepository
{
	constructor(
		@Inject(DB) private readonly db: TDatabase,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		@Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork
	) {}

	async upsert(
		data: CreateEmailVerificationInput,
		tx: ITransactionContext
	): Promise<EmailVerification> {
		return traceDbOp(
			this.tracer,
			'db.emailVerifications.upsert',
			{
				'db.table': 'storefront_email_verifications',
				'db.operation': 'upsert',
			},
			async () => {
				const executor = DrizzleUnitOfWork.unwrap(tx);

				// Delete any existing pending verifications for this user first (one token at a time)
				await executor
					.delete(storefrontEmailVerifications)
					.where(eq(storefrontEmailVerifications.userId, data.userId));

				const [inserted] = await executor
					.insert(storefrontEmailVerifications)
					.values({
						id: data.id,
						storeId: data.storeId,
						userId: data.userId,
						tokenHash: data.tokenHash,
						expiresAt: data.expiresAt,
					})
					.returning();

				return EmailVerificationMapper.toDomain(inserted);
			}
		);
	}

	async findByUserId(
		storeId: string,
		userId: string,
		tokenHash: string
	): Promise<EmailVerification | null> {
		return traceDbOp(
			this.tracer,
			'db.emailVerifications.findByTokenHash',
			{
				'db.table': 'storefront_email_verifications',
				'db.operation': 'select',
			},
			async () => {
				const now = new Date();
				const [row] = await this.db
					.select()
					.from(storefrontEmailVerifications)
					.where(
						and(
							eq(storefrontEmailVerifications.storeId, storeId),
							eq(storefrontEmailVerifications.tokenHash, tokenHash),
							eq(storefrontEmailVerifications.userId, userId),
							// filter out expired tokens at the DB level: expiresAt > now
							gt(storefrontEmailVerifications.expiresAt, now)
						)
					)
					.limit(1);

				return row ? EmailVerificationMapper.toDomain(row) : null;
			}
		);
	}

	async deleteById(id: string, tx?: ITransactionContext): Promise<void> {
		return traceDbOp(
			this.tracer,
			'db.emailVerifications.deleteById',
			{
				'db.table': 'storefront_email_verifications',
				'db.operation': 'delete',
			},
			async () => {
				if (tx) {
					return this.runDeleteById(tx, id);
				}
				return this.uow.execute((ctx) => this.runDeleteById(ctx, id));
			}
		);
	}

	private async runDeleteById(
		ctx: ITransactionContext,
		id: string
	): Promise<void> {
		const executor = DrizzleUnitOfWork.unwrap(ctx);
		await executor
			.delete(storefrontEmailVerifications)
			.where(eq(storefrontEmailVerifications.id, id));
	}

	async deleteByUserId(userId: string, tx: ITransactionContext): Promise<void> {
		return traceDbOp(
			this.tracer,
			'db.emailVerifications.deleteByUserId',
			{
				'db.table': 'storefront_email_verifications',
				'db.operation': 'delete',
			},
			async () => {
				const executor = DrizzleUnitOfWork.unwrap(tx);
				await executor
					.delete(storefrontEmailVerifications)
					.where(eq(storefrontEmailVerifications.userId, userId));
			}
		);
	}

	async findMostRecentByUserId(
		storeId: string,
		userId: string
	): Promise<EmailVerification | null> {
		return traceDbOp(
			this.tracer,
			'db.emailVerifications.findMostRecentByUserId',
			{
				'db.table': 'storefront_email_verifications',
				'db.operation': 'select',
			},
			async () => {
				const [row] = await this.db
					.select()
					.from(storefrontEmailVerifications)
					.where(
						and(
							eq(storefrontEmailVerifications.storeId, storeId),
							eq(storefrontEmailVerifications.userId, userId)
						)
					)
					.orderBy(desc(storefrontEmailVerifications.createdAt))
					.limit(1);

				return row ? EmailVerificationMapper.toDomain(row) : null;
			}
		);
	}
}
