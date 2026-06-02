import { err, ok, type Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer, OTEL_TRACER } from '@core/tracer';
import { type GetStoreInvitationResponse } from '@ferrite/schema/stores/get-store-invitation.zodschema';
import { InvitationExpiredError } from '@modules/store/domain/errors/invitation-expired.error';
import { InvitationNotFoundError } from '@modules/store/domain/errors/invitation-not-found.error';
import type {
	GetStoreInvitationError,
	GetStoreInvitationInput,
	IGetStoreInvitationUseCase,
} from '@modules/store/domain/ports/member-use-cases.port';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '@modules/store/domain/ports/store.repository.port';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GetStoreInvitationUseCase implements IGetStoreInvitationUseCase {
	constructor(
		@Inject(STORE_REPOSITORY)
		private readonly storeRepository: IStoreRepository,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(
		input: GetStoreInvitationInput
	): Promise<Result<GetStoreInvitationResponse, GetStoreInvitationError>> {
		return this.tracer.withSpan('use-case.get-store-invitation', async () => {
			const invitation = await this.storeRepository.findInvitationByIdAndEmail(
				input.invitationId,
				input.userEmail
			);

			if (!invitation) {
				return err(new InvitationNotFoundError());
			}

			// If the invitation has already been accepted or declined, we treat it as not found to prevent any further actions on it.
			if (
				invitation.status === 'accepted' ||
				invitation.status === 'declined'
			) {
				return err(new InvitationNotFoundError());
			}

			if (new Date(invitation.expiresAt) < new Date()) {
				return err(new InvitationExpiredError());
			}

			return ok(invitation as GetStoreInvitationResponse);
		});
	}
}
