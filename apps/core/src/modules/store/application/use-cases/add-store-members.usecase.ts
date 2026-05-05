import { ok, type Result } from '@common/interfaces/result.interface';
import type { ITransactionContext } from '@common/interfaces/unit-of-work.interface';
import type { IUseCase } from '@common/interfaces/use-case.interface';
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
		private readonly repo: IStoreRepository
	) {}

	async execute(input: AddStoreMembersInput): Promise<Result<void, Error>> {
		await this.repo.addStoreMembers(
			input.tx,
			input.storeId,
			input.userIds,
			input.roleId,
			input.isOwner ?? false
		);
		return ok();
	}
}
