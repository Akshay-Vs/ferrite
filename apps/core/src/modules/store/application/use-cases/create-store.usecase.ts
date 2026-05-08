import { err, ok, type Result } from '@common/interfaces/result.interface';
import type { ITransactionContext } from '@common/interfaces/unit-of-work.interface';
import type { IUseCase } from '@common/interfaces/use-case.interface';
import type { Store } from '@core/database/schema/store.schema';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { Inject, Injectable } from '@nestjs/common';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '../../domain/ports/store.repository.port';
import type { CreateStoreInput } from '../../domain/schemas/create-store.zodschema';

export interface CreateStoreInputWithContext {
	tx?: ITransactionContext;
	input: CreateStoreInput;
	createdBy: string;
}

export const CREATE_STORE_UC = Symbol('CreateStoreUseCase');

@Injectable()
export class CreateStoreUseCase
	implements IUseCase<CreateStoreInputWithContext, Store, Error>
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
		input: CreateStoreInputWithContext
	): Promise<Result<Store, Error>> {
		return this.tracer.withSpan('CreateStoreUseCase.execute', async () => {
			try {
				const store = await this.repo.createStore(
					input.tx,
					input.input,
					input.createdBy
				);
				this.logger.debug(
					`Created store: id=${store.id}, name=${input.input.name}`
				);
				return ok(store);
			} catch (e) {
				const error = e instanceof Error ? e : new Error(String(e));
				this.logger.error(
					`Failed to create store: ${error.message}`,
					error.stack
				);
				return err(error);
			}
		});
	}
}
