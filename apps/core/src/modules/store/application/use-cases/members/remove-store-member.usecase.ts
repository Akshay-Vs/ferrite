import { err, ok, type Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { Inject, Injectable } from '@nestjs/common';
import { MemberNotFoundError } from '../../../domain/errors/member-not-found.error';
import { OwnerProtectedError } from '../../../domain/errors/owner-protected.error';
import {
	type IRemoveStoreMemberUseCase,
	type RemoveStoreMemberError,
	type RemoveStoreMemberInput,
} from '../../../domain/ports/member-use-cases.port';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '../../../domain/ports/store.repository.port';
import {
	type IStorePermissionChecker,
	STORE_PERMISSION_CHECKER,
} from '../../../domain/ports/store-permission-checker.port';

@Injectable()
export class RemoveStoreMemberUseCase implements IRemoveStoreMemberUseCase {
	constructor(
		@Inject(STORE_REPOSITORY)
		private readonly repo: IStoreRepository,
		@Inject(STORE_PERMISSION_CHECKER)
		private readonly permissionChecker: IStorePermissionChecker,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(
		input: RemoveStoreMemberInput
	): Promise<Result<void, RemoveStoreMemberError>> {
		return this.tracer.withSpan(
			'RemoveStoreMemberUseCase.execute',
			async () => {
				try {
					const isOwner = await this.repo.isMemberOwner(
						input.storeId,
						input.userId
					);
					if (isOwner) {
						return err(new OwnerProtectedError());
					}

					const removed = await this.repo.removeStoreMember(
						input.tx,
						input.storeId,
						input.userId
					);
					if (!removed) {
						return err(new MemberNotFoundError(input.userId, input.storeId));
					}

					this.logger.debug(
						`Removed member from store: storeId=${input.storeId}, userId=${input.userId}`
					);

					try {
						await this.permissionChecker.invalidatePermissions(
							input.userId,
							input.storeId
						);
					} catch (cacheErr) {
						this.logger.warn(
							`Cache invalidation failed for user ${input.userId} in store ${input.storeId}`,
							String(cacheErr)
						);
					}

					return ok();
				} catch (e) {
					const error = e instanceof Error ? e : new Error(String(e));
					this.logger.error(
						`Failed to remove store member: ${error.message}`,
						error.stack
					);
					return err(error);
				}
			}
		);
	}
}
