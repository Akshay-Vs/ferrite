import { err, ok, Result } from '@common/interfaces/result.interface';
import { OutboxPublishError } from '@modules/outbox/domain/errors/outbox-publish-error';
import {
	type IOutboxRepository,
	OUTBOX_REPOSITORY,
} from '@modules/outbox/domain/ports/outbox-repository.port';
import {
	IInsertOutboxEvent,
	OutboxInput,
} from '@modules/outbox/domain/ports/outbox-usecases.port';
import { Inject, Injectable } from '@nestjs/common';

export const INSERT_OUTBOX_EVENT_UC = Symbol('PUBLISH_OUTBOX_EVENT_UC');

@Injectable()
export class InsertOutboxEventUseCase implements IInsertOutboxEvent {
	constructor(
		@Inject(OUTBOX_REPOSITORY) private readonly repo: IOutboxRepository
	) {}

	async execute(input: OutboxInput): Promise<Result<void, Error>> {
		try {
			await this.repo.insert(input.event, input.tx);
			return ok();
		} catch (error) {
			return err(new OutboxPublishError(input.event.eventType, error));
		}
	}
}
