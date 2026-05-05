import { ok, type Result } from '@common/interfaces/result.interface';
import type { IUseCase } from '@common/interfaces/use-case.interface';
import type { StoreRole } from '@core/database/schema/store.schema';
import { Inject, Injectable } from '@nestjs/common';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '../../domain/ports/store.repository.port';

export const GET_STORE_ROLES_UC = Symbol('GetStoreRolesUseCase');

@Injectable()
export class GetStoreRolesUseCase
	implements IUseCase<string, StoreRole[], Error>
{
	constructor(
		@Inject(STORE_REPOSITORY)
		private readonly repo: IStoreRepository
	) {}

	async execute(storeId: string): Promise<Result<StoreRole[], Error>> {
		const roles = await this.repo.findRolesByStoreId(storeId);
		return ok(roles);
	}
}
