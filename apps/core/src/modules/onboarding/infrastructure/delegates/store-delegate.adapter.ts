import type { ITransactionContext } from '@common/interfaces/unit-of-work.interface';
import { generateSlug } from '@common/utils/generate-slug.util';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer, OTEL_TRACER } from '@core/tracer';
import type { OnboardingStorePayload } from '@ferrite/schema';
import type { IStoreDelegate } from '@modules/onboarding/domain/ports/store-delegate.port';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '@modules/store/domain/ports/store.repository.port';
import {
	type IInitializeStoreOrchestratorUseCase,
	INITIALIZE_STORE_ORCHESTRATOR_UC,
} from '@modules/store/domain/ports/store-use-cases.port';
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
		@Inject(INITIALIZE_STORE_ORCHESTRATOR_UC)
		private readonly initializeStoreUc: IInitializeStoreOrchestratorUseCase,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async createStoreWithOwner(
		input: OnboardingStorePayload,
		createdBy: string,
		tx?: ITransactionContext
	): Promise<string> {
		// Generate a slug from the store name
		const slug = generateSlug(input.name);

		return this.tracer.withSpan(
			'StoreDelegateAdapter.createStoreWithOwner',
			async () => {
				const result = await this.initializeStoreUc.execute({
					input,
					createdBy,
					tx,
				});

				if (result.isErr()) {
					throw result.error;
				}

				return result.value.id;
			},
			{ storeSlug: slug, userId: createdBy }
		);
	}

	async hasStores(userId: string): Promise<boolean> {
		const userStores = await this.tracer.withSpan(
			'StoreDelegateAdapter.hasStores',
			() => this.storeRepo.findByUserId(userId),
			{ userId }
		);
		return userStores.items.length > 0;
	}
}
