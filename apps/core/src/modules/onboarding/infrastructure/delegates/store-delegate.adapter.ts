import type { ITransactionContext } from '@common/interfaces/unit-of-work.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer, OTEL_TRACER } from '@core/tracer';
import type { IStoreDelegate } from '@modules/onboarding/domain/ports/store-delegate.port';
import type { SubmitStoreCreationInput } from '@modules/onboarding/domain/schemas/submit-store-creation.zodschema';
import { InitializeStoreOrchestratorUseCase } from '@modules/store/application/use-cases/initialize-store-orchestrator.usecase';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '@modules/store/domain/ports/store.repository.port';
import { Inject, Injectable } from '@nestjs/common';

/**
 * Infrastructure adapter bridging the Onboarding module's `IStoreDelegate` port
 * to the Store module's existing `InitializeStoreOrchestratorUseCase`.
 *
 * Unwraps the UoW `ITransactionContext` and passes it to the orchestrator,
 * which runs all steps (create store + role + permissions + member) in that
 * external transaction — zero duplication.
 */
@Injectable()
export class StoreDelegateAdapter implements IStoreDelegate {
	constructor(
		@Inject(STORE_REPOSITORY) private readonly storeRepo: IStoreRepository,
		private readonly initializeStoreUc: InitializeStoreOrchestratorUseCase,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async createStoreWithOwner(
		input: SubmitStoreCreationInput,
		createdBy: string,
		tx?: ITransactionContext
	): Promise<string> {
		return this.tracer.withSpan(
			'StoreDelegateAdapter.createStoreWithOwner',
			async () => {
				const result = await this.initializeStoreUc.execute({
					input: {
						name: input.name,
						slug: input.slug,
						description: input.description,
						bannerUrl: input.bannerUrl,
						iconUrl: input.iconUrl,
					},
					createdBy,
					tx,
				});

				if (result.isErr()) {
					throw result.error;
				}

				return result.value.id;
			},
			{ storeSlug: input.slug, userId: createdBy }
		);
	}

	async hasStores(userId: string): Promise<boolean> {
		const userStores = await this.tracer.withSpan(
			'StoreDelegateAdapter.hasStores',
			() => this.storeRepo.findByUserId(userId),
			{ userId }
		);
		return userStores.length > 0;
	}
}
