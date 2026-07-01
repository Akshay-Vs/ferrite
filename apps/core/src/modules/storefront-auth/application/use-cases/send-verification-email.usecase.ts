import { createHash, randomBytes } from 'node:crypto';
import { err, ok, type Result } from '@common/interfaces/result.interface';
import {
	type ITransactionContext,
	type IUnitOfWork,
	UNIT_OF_WORK,
} from '@common/interfaces/unit-of-work.interface';
import { DrizzleUnitOfWork } from '@core/database/drizzle-unit-of-work';
import { storePreferences } from '@core/database/schema/preferences.schema';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer, OTEL_TRACER } from '@core/tracer';
import { EmailTemplate } from '@ferrite/schema/notification/email.zodschema';
import {
	ENQUEUE_SEND_EMAIL_UC,
	type IEnqueueSendEmail,
} from '@modules/notifications';
import { IncompleteConfigurationError } from '@modules/store';
import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import {
	type IStorefrontEmailVerificationRepository,
	STOREFRONT_EMAIL_VERIFICATION_REPOSITORY,
} from '../../domain/ports/email-verification-repository.port';
import type {
	ISendVerificationEmail,
	SendVerificationEmailInput,
} from '../../domain/ports/email-verification-usecase.port';

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

@Injectable()
export class SendVerificationEmailUseCase implements ISendVerificationEmail {
	constructor(
		@Inject(STOREFRONT_EMAIL_VERIFICATION_REPOSITORY)
		private readonly verificationRepo: IStorefrontEmailVerificationRepository,
		@Inject(ENQUEUE_SEND_EMAIL_UC)
		private readonly enqueueEmail: IEnqueueSendEmail,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		@Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(
		input: SendVerificationEmailInput
	): Promise<Result<void, Error | IncompleteConfigurationError>> {
		return this.tracer.withSpan(
			'use-case.send-verification-email',
			async () => {
				try {
					// Generate a cryptographically random 32-byte token
					const rawToken = randomBytes(32).toString('hex');
					const tokenHash = createHash('sha256').update(rawToken).digest('hex');
					const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MS);
					const verificationId = crypto.randomUUID();

					const performWork = async (txn: ITransactionContext) => {
						// Upsert: wipe old tokens, insert new one — atomically
						await this.verificationRepo.upsert(
							{
								id: verificationId,
								storeId: input.storeId,
								userId: input.userId,
								tokenHash,
								expiresAt,
							},
							txn
						);

						const executor = DrizzleUnitOfWork.unwrap(txn);
						const [prefs] = await executor
							.select()
							.from(storePreferences)
							.where(eq(storePreferences.storeId, input.storeId))
							.limit(1);

						if (!prefs?.frontendUrl) {
							throw new IncompleteConfigurationError(
								'Incomplete store configuration, Missing front-end url'
							);
						}
						const frontendUrl = prefs.frontendUrl;

						const enqueueResult = await this.enqueueEmail.execute(txn, {
							id: `email:storefront-verify-email:${verificationId}`,
							recipient: input.email,
							template: EmailTemplate.STOREFRONT_VERIFY_EMAIL,
							subject: 'Verify your email address',
							payload: {
								token: rawToken,
								storeId: input.storeId,
								userId: input.userId,
								frontendUrl,
							},
						});

						if (enqueueResult.isErr()) {
							this.logger.error(
								`Failed to enqueue verification email: ${enqueueResult.error.message}`
							);
							throw enqueueResult.error;
						}
					};

					// If an outer transaction is provided (e.g., from registration), join it.
					// Otherwise open a new transaction.
					if (input.tx) {
						await performWork(input.tx);
					} else {
						await this.uow.execute(performWork);
					}

					this.logger.debug(
						`Verification email enqueued: userId=${input.userId} storeId=${input.storeId}`
					);

					return ok();
				} catch (caught: unknown) {
					const error =
						caught instanceof Error ? caught : new Error(String(caught));
					this.logger.error(
						`SendVerificationEmailUseCase failed: ${error.message}`
					);
					return err(error);
				}
			}
		);
	}
}
