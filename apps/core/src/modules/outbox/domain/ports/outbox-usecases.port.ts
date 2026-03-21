import { IUseCase } from '@common/interfaces/use-case.interface';
import { CreateOutboxEvent } from '../schemas/outbox-event.zodschema';

export type OutboxInput = {
	event: CreateOutboxEvent;
	tx?: unknown;
};

export type IInsertOutboxEvent = IUseCase<OutboxInput, void, Error>;
