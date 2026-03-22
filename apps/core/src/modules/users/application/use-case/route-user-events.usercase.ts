import { err, ok, Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { UnsupportedEventTypeError } from '@core/queue/queue.errors';
import { Inject, Injectable } from '@nestjs/common';
import {
	CREATE_USER_UC,
	DELETE_USER_UC,
	type ICreateUserUseCase,
	type IDeleteUserUseCase,
	type IRouteUserEventsUseCase,
} from '@users/domain/ports/use-cases.port';

@Injectable()
export class RouteUserEventsUsecase implements IRouteUserEventsUseCase {
	constructor(
		private readonly logger: AppLogger,
		@Inject(CREATE_USER_UC) private readonly createUser: ICreateUserUseCase,
		@Inject(DELETE_USER_UC) private readonly deleteUser: IDeleteUserUseCase
	) {
		this.logger.setContext(this.constructor.name);
	}
	async execute(rawEvent: any): Promise<Result<void, Error>> {
		// Extract eventType
		const eventType = rawEvent?.eventType ?? rawEvent?.type;

		switch (eventType) {
			case 'user.created':
				this.logger.debug(`hit user.created event`);
				return this.createUser.execute(rawEvent);

			case 'user.deleted': {
				this.logger.debug(`hit user.deleted event`);
				const result = await this.deleteUser.execute(rawEvent);
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
