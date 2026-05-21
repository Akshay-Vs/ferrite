import { err, ok, type Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { Inject, Injectable } from '@nestjs/common';
import { RoleNotFoundError } from '../../../domain/errors/role-not-found.error';
import { SystemRoleProtectedError } from '../../../domain/errors/system-role-protected.error';
import {
	type AddStoreMemberInput,
	type IAddStoreMemberUseCase,
} from '../../../domain/ports/member-use-cases.port';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '../../../domain/ports/store.repository.port';

@Injectable()
export class AddStoreMemberUseCase implements IAddStoreMemberUseCase {
	constructor(
		@Inject(STORE_REPOSITORY)
		private readonly repo: IStoreRepository,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(input: AddStoreMemberInput): Promise<Result<void, Error>> {
		return this.tracer.withSpan('AddStoreMemberUseCase.execute', async () => {
			try {
				const role = await this.repo.findRoleById(input.storeId, input.roleId);
				if (!role) {
					return err(new RoleNotFoundError(input.roleId, input.storeId));
				}

				if (role.isSystem && !input.isOwner) {
					return err(new SystemRoleProtectedError(input.roleId));
				}

				await this.repo.addStoreMember(
					input.tx,
					input.storeId,
					input.userId,
					input.roleId,
					input.isOwner
				);
				this.logger.debug(
					`Added member to store: storeId=${input.storeId}, userId=${input.userId}`
				);
				return ok();
			} catch (e) {
				const error = e instanceof Error ? e : new Error(String(e));
				this.logger.error(
					`Failed to add member to store: ${error.message}`,
					error.stack
				);
				return err(error);
			}
		});
	}
}
