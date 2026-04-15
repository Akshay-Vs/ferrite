import { ok, type Result } from '@common/interfaces/result.interface';
import type { IUseCase } from '@common/interfaces/use-case.interface';
import { Inject, Injectable } from '@nestjs/common';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '../../domain/ports/store.repository.port';

export interface AddStoreMemberInput {
	tx: unknown;
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
		private readonly repo: IStoreRepository
	) {}

	async execute(input: AddStoreMemberInput): Promise<Result<void, Error>> {
		await this.repo.addStoreMember(
			input.tx,
			input.storeId,
			input.userId,
			input.roleId,
			input.isOwner
		);
		return ok();
	}
}
