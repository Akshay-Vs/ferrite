import { ok, type Result } from '@common/interfaces/result.interface';
import type { IUseCase } from '@common/interfaces/use-case.interface';
import type { StoreMember } from '@core/database/schema/store.schema';
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
		private readonly repo: IStoreRepository
	) {}

	async execute(
		input: GetRoleMembersInput
	): Promise<Result<StoreMember[], Error>> {
		const members = await this.repo.findRoleMembers(
			input.storeId,
			input.roleId
		);
		return ok(members);
	}
}
