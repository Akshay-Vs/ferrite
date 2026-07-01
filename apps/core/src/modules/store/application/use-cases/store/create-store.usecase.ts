import { err, ok, type Result } from '@common/interfaces/result.interface';
import type { Store } from '@core/database/schema/store.schema';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { EmailTemplate } from '@ferrite/schema/notification/email.zodschema';
import {
	ENQUEUE_SEND_EMAIL_UC,
	type IEnqueueSendEmail,
} from '@modules/notifications';
import {
	type IUserRepository,
	USER_REPOSITORY,
} from '@modules/users/domain/ports/user-repository.port';
import { Inject, Injectable } from '@nestjs/common';
import {
	type IStoreRepository,
	STORE_REPOSITORY,
} from '../../../domain/ports/store.repository.port';
import {
	type CreateStoreInputWithContext,
	type ICreateStoreUseCase,
} from '../../../domain/ports/store-use-cases.port';

@Injectable()
export class CreateStoreUseCase implements ICreateStoreUseCase {
	constructor(
		@Inject(STORE_REPOSITORY)
		private readonly repo: IStoreRepository,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger,
		@Inject(ENQUEUE_SEND_EMAIL_UC)
		private readonly enqueueEmail: IEnqueueSendEmail,
		@Inject(USER_REPOSITORY)
		private readonly userRepo: IUserRepository
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(
		input: CreateStoreInputWithContext
	): Promise<Result<Store, Error>> {
		return this.tracer.withSpan('CreateStoreUseCase.execute', async () => {
			try {
				const store = await this.repo.createStore(
					input.tx,
					input.input,
					input.createdBy
				);

				const user = await this.userRepo.findById(input.createdBy);
				if (user) {
					const enqueueResult = await this.enqueueEmail.execute(input.tx, {
						id: `email:welcome-aboard:${store.id}`,
						recipient: user.email,
						template: EmailTemplate.WELCOME_ABOARD,
						subject: 'Welcome aboard',
						payload: {
							storeId: store.id,
							storeName: store.name,
						},
					});

					if (enqueueResult.isErr()) {
						this.logger.error(
							`Failed to enqueue email: ${enqueueResult.error.message}`,
							enqueueResult.error.stack
						);
						return err(enqueueResult.error);
					}
				}

				this.logger.debug(
					`Created store: id=${store.id}, name=${input.input.name}`
				);
				return ok(store);
			} catch (e) {
				const error = e instanceof Error ? e : new Error(String(e));
				this.logger.error(
					`Failed to create store: ${error.message}`,
					error.stack
				);
				return err(error);
			}
		});
	}
}
