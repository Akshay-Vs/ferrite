import { InfrastructureError } from '@common/errors/infrastructure.error';
import { err, ok, Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { Inject, Injectable } from '@nestjs/common';
import type { IGetAllUsersUseCase } from '@users/domain/ports/use-cases.port';
import {
	type IUserRepository,
	USER_REPOSITORY,
} from '@users/domain/ports/user-repository.port';
import type { UserProfileFull } from '@users/domain/schemas/user-profile.zodschema';

@Injectable()
export class GetAllUsersUseCase implements IGetAllUsersUseCase {
	constructor(
		@Inject(USER_REPOSITORY) private readonly repo: IUserRepository,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(input?: {
		cursor?: string;
		limit?: number;
		filters?: Partial<UserProfileFull>;
	}): Promise<
		Result<
			{ items: UserProfileFull[]; nextCursor?: string },
			InfrastructureError
		>
	> {
		return this.tracer.withSpan('use-case.get-all-users', async () => {
			try {
				const result = await this.repo.findAll(
					input?.cursor,
					input?.limit,
					input?.filters
				);
				this.logger.debug(`Fetched ${result.items.length} users`);
				return ok(result);
			} catch (e: any) {
				return err(new InfrastructureError('Failed to fetch users', e));
			}
		});
	}
}
