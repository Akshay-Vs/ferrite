import { err, ok, type Result } from '@common/interfaces/result.interface';
import type { IUseCase } from '@common/interfaces/use-case.interface';
import type { StoreRole } from '@core/database/schema/store.schema';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
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
		private readonly repo: IStoreRepository,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(storeId: string): Promise<Result<StoreRole[], Error>> {
		return this.tracer.withSpan('GetStoreRolesUseCase.execute', async () => {
			try {
				const roles = await this.repo.findRolesByStoreId(storeId);
				this.logger.debug(
					`Fetched ${roles.length} roles for store: storeId=${storeId}`
				);
				return ok(roles);
			} catch (e) {
				const error = e instanceof Error ? e : new Error(String(e));
				this.logger.error(
					`Failed to fetch store roles: ${error.message}`,
					error.stack
				);
				return err(error);
			}
		});
	}
}
