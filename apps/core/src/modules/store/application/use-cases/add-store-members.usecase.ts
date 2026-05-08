import { err, ok, type Result } from '@common/interfaces/result.interface';
import type { ITransactionContext } from '@common/interfaces/unit-of-work.interface';
import type { IUseCase } from '@common/interfaces/use-case.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { Inject, Injectable } from '@nestjs/common';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '../../domain/ports/store.repository.port';

export interface AddStoreMembersInput {
	tx?: ITransactionContext;
	storeId: string;
	userIds: string[];
	roleId: string;
	isOwner?: boolean;
}

export const ADD_STORE_MEMBERS_UC = Symbol('AddStoreMembersUseCase');

@Injectable()
export class AddStoreMembersUseCase
	implements IUseCase<AddStoreMembersInput, void, Error>
{
	constructor(
		@Inject(STORE_REPOSITORY)
		private readonly repo: IStoreRepository,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(input: AddStoreMembersInput): Promise<Result<void, Error>> {
		return this.tracer.withSpan('AddStoreMembersUseCase.execute', async () => {
			try {
				await this.repo.addStoreMembers(
					input.tx,
					input.storeId,
					input.userIds,
					input.roleId,
					input.isOwner ?? false
				);
				this.logger.debug(
					`Added members to store: storeId=${input.storeId}, count=${input.userIds.length}`
				);
				return ok();
			} catch (e) {
				const error = e instanceof Error ? e : new Error(String(e));
				this.logger.error(
					`Failed to add members to store: ${error.message}`,
					error.stack
				);
				return err(error);
			}
		});
	}
}
