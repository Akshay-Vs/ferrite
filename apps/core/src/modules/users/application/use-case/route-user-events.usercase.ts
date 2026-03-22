import { err, ok, Result } from '@common/interfaces/result.interface';
import { EventPayload } from '@common/schemas/event-payload.zodschema';
import { AppLogger } from '@core/logger/logger.service';
import { UnsupportedEventTypeError } from '@core/queue/queue.errors';
import { Inject, Injectable } from '@nestjs/common';
import {
	CREATE_USER_UC,
	type ICreateUserUseCase,
	type IRouteUserEventsUseCase,
	type ISyncUserDeletionUseCase,
	SYNC_USER_DELETION_UC,
} from '@users/domain/ports/use-cases.port';

@Injectable()
export class RouteUserEventsUsecase implements IRouteUserEventsUseCase {
	constructor(
		private readonly logger: AppLogger,
		@Inject(CREATE_USER_UC) private readonly createUser: ICreateUserUseCase,
		@Inject(SYNC_USER_DELETION_UC)
		private readonly syncDelete: ISyncUserDeletionUseCase
	) {
		this.logger.setContext(this.constructor.name);
	}
	async execute(payload: EventPayload): Promise<Result<void, Error>> {
		// Extract eventType
		const eventType = payload.eventType;

		switch (eventType) {
			case 'user.created':
				return this.createUser.execute(payload);

			case 'user.deleted': {
				const result = await this.syncDelete.execute(payload);
				if (result.isErr()) {
					return err(result.error);
				}
				return ok();
			}

			default: {
				this.logger.warn(`Unsupported event type: ${eventType}`);
				return err(new UnsupportedEventTypeError(eventType));
			}
		}
	}
}
