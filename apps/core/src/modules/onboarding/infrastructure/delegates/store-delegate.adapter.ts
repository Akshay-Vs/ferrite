import type { ITransactionContext } from '@common/interfaces/unit-of-work.interface';
import { DrizzleUnitOfWork } from '@core/database/drizzle-unit-of-work';
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
		private readonly initializeStoreUc: InitializeStoreOrchestratorUseCase
	) {}

	async createStoreWithOwner(
		input: SubmitStoreCreationInput,
		createdBy: string,
		tx?: ITransactionContext
	): Promise<string> {
		// Unwrap the UoW context to a raw Drizzle tx that the store repo understands
		const rawTx = tx ? DrizzleUnitOfWork.unwrap(tx) : undefined;

		const result = await this.initializeStoreUc.execute({
			input: {
				name: input.name,
				slug: input.slug,
				description: input.description,
				bannerUrl: input.bannerUrl,
				iconUrl: input.iconUrl,
			},
			createdBy,
			tx: rawTx,
		});

		if (result.isErr()) {
			throw result.error;
		}

		return result.value.id;
	}

	async hasStores(userId: string): Promise<boolean> {
		const userStores = await this.storeRepo.findByUserId(userId);
		return userStores.length > 0;
	}
}
