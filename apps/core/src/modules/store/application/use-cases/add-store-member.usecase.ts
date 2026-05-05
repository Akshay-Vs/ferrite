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

export interface AddStoreMemberInput {
	tx?: ITransactionContext;
	storeId: string;
	userId: string;
	roleId: string;
	isOwner: boolean;
}

export const ADD_STORE_MEMBER_UC = Symbol('AddStoreMemberUseCase');

@Injectable()
export class AddStoreMemberUseCase
	implements IUseCase<AddStoreMemberInput, void, Error>
{
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
