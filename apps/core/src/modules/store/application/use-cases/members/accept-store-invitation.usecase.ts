import { err, ok, type Result } from '@common/interfaces/result.interface';
import {
	ITransactionContext,
	type IUnitOfWork,
	UNIT_OF_WORK,
} from '@common/interfaces/unit-of-work.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer, OTEL_TRACER } from '@core/tracer';
import { GetStoreInvitationResponse } from '@ferrite/schema/stores/get-store-invitation.zodschema';
import { InvitationExpiredError } from '@modules/store/domain/errors/invitation-expired.error';
import { InvitationNotFoundError } from '@modules/store/domain/errors/invitation-not-found.error';
import type {
	AcceptStoreInvitationError,
	AcceptStoreInvitationInput,
	IAcceptStoreInvitationUseCase,
} from '@modules/store/domain/ports/member-use-cases.port';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '@modules/store/domain/ports/store.repository.port';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AcceptStoreInvitationUseCase
	implements IAcceptStoreInvitationUseCase
{
	constructor(
		@Inject(STORE_REPOSITORY)
		private readonly storeRepository: IStoreRepository,
		@Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(
		input: AcceptStoreInvitationInput
	): Promise<Result<void, AcceptStoreInvitationError>> {
		return this.tracer.withSpan(
			'use-case.accept-store-invitation',
			async () => {
				// Pre-flight read (outside tx) – acts as an early-exit fast path.
				const invitation =
					await this.storeRepository.findInvitationByIdAndEmail(
						input.invitationId,
						input.userEmail
					);

				if (!invitation) {
					return err(new InvitationNotFoundError());
				}

				if (
					invitation.status === 'accepted' ||
					invitation.status === 'declined'
				) {
					return err(new InvitationNotFoundError());
				}

				if (new Date(invitation.expiresAt) < new Date()) {
					return err(new InvitationExpiredError());
				}

				// The actual state transition runs inside a transaction so that
				// the conditional update + member insert are atomic.
				const result = input.tx
					? await this.accept(input.tx, input, invitation)
					: await this.uow.execute(async (tx) =>
							this.accept(tx, input, invitation)
						);

				return result;
			}
		);
	}

	/**
	 * Handles the acceptance of a store invitation within a transaction context.
	 *
	 * The conditional update (`WHERE status = 'pending'`) inside acceptInvitation
	 * addStoreMember uses conflict-safe insert so a duplicate membership is a no-op.
	 */
	private async accept(
		tx: ITransactionContext,
		input: AcceptStoreInvitationInput,
		invitation: GetStoreInvitationResponse
	): Promise<Result<void, AcceptStoreInvitationError>> {
		const accepted = await this.storeRepository.acceptInvitation(
			tx,
			input.invitationId
		);

		// If no row was updated the invitation was already accepted/declined
		// by a concurrent request — treat as not found.
		if (!accepted) {
			return err(new InvitationNotFoundError());
		}

		await this.storeRepository.addStoreMember(
			tx,
			invitation.store.id,
			input.userId,
			invitation.role.id,
			false
		);
		return ok();
	}
}
