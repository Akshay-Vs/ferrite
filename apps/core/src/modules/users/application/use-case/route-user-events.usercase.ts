import { err, Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { UnsupportedEventTypeError } from '@core/queue/queue.errors';
import { Inject, Injectable } from '@nestjs/common';
import {
	CREATE_USER_UC,
	type ICreateUserUseCase,
	type IRouteUserEventsUseCase,
} from '@users/domain/ports/use-cases.port';
import { type UserSyncEvent } from '@users/domain/schemas';

@Injectable()
export class RouteUserEventsUsecase implements IRouteUserEventsUseCase {
	constructor(
		private readonly logger: AppLogger,
		@Inject(CREATE_USER_UC) private readonly createUser: ICreateUserUseCase
	) {
		this.logger.setContext(this.constructor.name);
	}
	async execute(userSyncEvent: UserSyncEvent): Promise<Result<void, Error>> {
		// Dispatch to use-case
		const eventType = userSyncEvent.eventType;

		switch (eventType) {
			case 'user.created':
				this.logger.debug(`hit user.created event`);
				return this.createUser.execute(userSyncEvent);
			default: {
				this.logger.warn(`Unsupported event type: ${eventType}`);
				return err(new UnsupportedEventTypeError(eventType));
			}
		}
	}
}
