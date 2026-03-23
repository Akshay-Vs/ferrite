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
import { context, propagation } from '@opentelemetry/api';

export const INSERT_OUTBOX_EVENT_UC = Symbol('PUBLISH_OUTBOX_EVENT_UC');

@Injectable()
export class InsertOutboxEventUseCase implements IInsertOutboxEvent {
	constructor(
		@Inject(OUTBOX_REPOSITORY) private readonly repo: IOutboxRepository
	) {}

	async execute(input: OutboxInput): Promise<Result<void, Error>> {
		try {
			// Capture the W3C propagation carrier from the current active context
			// so that downstream asynchronous workers (CDC & consumers) can resume
			// the trace as child spans.
			const traceContext: Record<string, string> = {};
			propagation.inject(context.active(), traceContext);

			const event = {
				...input.event,
				__traceContext: Object.keys(traceContext).length
					? traceContext
					: undefined,
			};

			await this.repo.insert(event, input.tx);
			return ok();
		} catch (error) {
			return err(new OutboxPublishError(input.event.eventType, error));
		}
	}
}
