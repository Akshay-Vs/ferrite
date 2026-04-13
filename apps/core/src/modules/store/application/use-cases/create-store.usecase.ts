import { ok, type Result } from '@common/interfaces/result.interface';
import type { IUseCase } from '@common/interfaces/use-case.interface';
import type { Store } from '@core/database/schema/store.schema';
import { Inject, Injectable } from '@nestjs/common';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '../../domain/ports/store.repository.port';
import type { CreateStoreInput } from '../../domain/schemas/create-store.zodschema';

export interface CreateStoreInputWithContext {
	tx: unknown;
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
		private readonly repo: IStoreRepository
	) {}

	async execute(
		input: CreateStoreInputWithContext
	): Promise<Result<Store, Error>> {
		const store = await this.repo.createStore(
			input.tx,
			input.input,
			input.createdBy
		);
		return ok(store);
	}
}
