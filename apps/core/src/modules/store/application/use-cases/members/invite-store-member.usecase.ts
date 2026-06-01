import { err, ok, type Result } from '@common/interfaces/result.interface';
import {
	type IUnitOfWork,
	UNIT_OF_WORK,
} from '@common/interfaces/unit-of-work.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { EmailTemplate } from '@ferrite/schema/notification/email.zodschema';
import {
	ENQUEUE_SEND_EMAIL_UC,
	type IEnqueueSendEmail,
} from '@modules/notifications';
import { Inject, Injectable } from '@nestjs/common';
import { RoleNotFoundError } from '../../../domain/errors/role-not-found.error';
import { SystemRoleProtectedError } from '../../../domain/errors/system-role-protected.error';
import {
	type IInviteStoreMemberUseCase,
	type InviteStoreMemberInput,
} from '../../../domain/ports/member-use-cases.port';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '../../../domain/ports/store.repository.port';

@Injectable()
export class InviteStoreMemberUseCase implements IInviteStoreMemberUseCase {
	constructor(
		@Inject(STORE_REPOSITORY)
		private readonly repo: IStoreRepository,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger,
		@Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
		@Inject(ENQUEUE_SEND_EMAIL_UC)
		private readonly enqueueEmail: IEnqueueSendEmail
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(input: InviteStoreMemberInput): Promise<Result<void, Error>> {
		return this.tracer.withSpan(
			'InviteStoreMemberUseCase.execute',
			async () => {
				try {
					const performInvite = async (
						txn: Parameters<Parameters<typeof this.uow.execute>[0]>[0]
					) => {
						const role = await this.repo.findRoleById(
							txn,
							input.storeId,
							input.roleId
						);
						if (!role) {
							return err(new RoleNotFoundError(input.roleId, input.storeId));
						}

						const isOwner = await this.repo.isMemberOwner(
							txn,
							input.storeId,
							input.invitedBy
						);

						if (role.isSystem && !isOwner) {
							return err(new SystemRoleProtectedError(input.roleId));
						}

						const store = await this.repo.findById(input.storeId);
						if (!store) {
							return err(new Error('Store not found'));
						}

						await this.repo.inviteStoreMember(
							txn,
							input.email,
							input.storeId,
							input.invitedBy,
							input.expiresAt,
							input.token,
							input.roleId
						);

						const enqueueResult = await this.enqueueEmail.execute(txn, {
							recipient: input.email,
							template: EmailTemplate.ORGANIZATION_INVITE,
							subject: 'You have been invited to a store',
							payload: {
								storeId: input.storeId,
								storeName: store.name,
								token: input.token,
							},
						});

						if (enqueueResult.isErr()) {
							this.logger.error(
								`Failed to enqueue email for store invite: ${enqueueResult.error.message}`,
								enqueueResult.error.stack
							);
							throw enqueueResult.error;
						}

						return ok();
					};

					const result = input.tx
						? await performInvite(input.tx)
						: await this.uow.execute(performInvite);

					if (result.isErr()) {
						return result as Result<void, Error>;
					}

					this.logger.debug(
						`Invited member to store: storeId=${input.storeId}, email=${input.email}`
					);
					return ok();
				} catch (e) {
					const error = e instanceof Error ? e : new Error(String(e));
					this.logger.error(
						`Failed to invite member to store: ${error.message}`,
						error.stack
					);
					return err(error);
				}
			}
		);
	}
}
