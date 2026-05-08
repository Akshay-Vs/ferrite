import { err, ok, type Result } from '@common/interfaces/result.interface';
import type { IUseCase } from '@common/interfaces/use-case.interface';
import type { StoreMember } from '@core/database/schema/store.schema';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { Inject, Injectable } from '@nestjs/common';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '../../domain/ports/store.repository.port';

export interface GetRoleMembersInput {
	storeId: string;
	roleId: string;
}

export const GET_ROLE_MEMBERS_UC = Symbol('GetRoleMembersUseCase');

@Injectable()
export class GetRoleMembersUseCase
	implements IUseCase<GetRoleMembersInput, StoreMember[], Error>
{
	constructor(
		@Inject(STORE_REPOSITORY)
		private readonly repo: IStoreRepository,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(
		input: GetRoleMembersInput
	): Promise<Result<StoreMember[], Error>> {
		return this.tracer.withSpan('GetRoleMembersUseCase.execute', async () => {
			try {
				const members = await this.repo.findRoleMembers(
					input.storeId,
					input.roleId
				);
				this.logger.debug(
					`Fetched ${members.length} members for role: roleId=${input.roleId}, storeId=${input.storeId}`
				);
				return ok(members);
			} catch (e) {
				const error = e instanceof Error ? e : new Error(String(e));
				this.logger.error(
					`Failed to fetch role members: ${error.message}`,
					error.stack
				);
				return err(error);
			}
		});
	}
}
