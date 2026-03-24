import { Logger } from '@nestjs/common';
import { OrderedAckQueue } from './ordered-ack-queue';

function makeLogger(): Logger {
	return {
		log: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
	} as unknown as Logger;
}

describe('OrderedAckQueue', () => {
	beforeEach(() => jest.useFakeTimers());
	afterEach(() => jest.useRealTimers());

	it('calls ack for a successful event', async () => {
		const logger = makeLogger();
		const queue = new OrderedAckQueue(logger, {
			batchSize: 1,
			flushIntervalMs: 1000,
		});

		const ack = jest.fn().mockResolvedValue(undefined);
		queue.enqueue(Promise.resolve(true), ack, 'LSN/1');

		await queue.drain();
		expect(ack).toHaveBeenCalledTimes(1);
	});

	it('does NOT throw and still advances LSN when an event resolves false (dead-lettered)', async () => {
		const logger = makeLogger();
		const queue = new OrderedAckQueue(logger, {
			batchSize: 1,
			flushIntervalMs: 1000,
		});

		const deadAck = jest.fn().mockResolvedValue(undefined);
		queue.enqueue(Promise.resolve(false), deadAck, 'LSN/bad');

		// Must not throw
		await expect(queue.drain()).resolves.toBeUndefined();

		// LSN of the dead-lettered event is still acknowledged
		expect(deadAck).toHaveBeenCalledTimes(1);
		expect(logger.warn).toHaveBeenCalled();
	});

	it('does NOT block subsequent events when one event resolves false', async () => {
		const logger = makeLogger();
		// batchSize=1 so each item flushes immediately
		const queue = new OrderedAckQueue(logger, {
			batchSize: 1,
			flushIntervalMs: 1000,
		});

		const ackBad = jest.fn().mockResolvedValue(undefined);
		const ackGood = jest.fn().mockResolvedValue(undefined);

		queue.enqueue(Promise.resolve(false), ackBad, 'LSN/1');
		queue.enqueue(Promise.resolve(true), ackGood, 'LSN/2');

		await expect(queue.drain()).resolves.toBeUndefined();

		// Both LSNs must be acknowledged in order
		expect(ackBad).toHaveBeenCalledTimes(1);
		expect(ackGood).toHaveBeenCalledTimes(1);
	});

	it('batches acknowledgements — only the last ack in a batch is called', async () => {
		const logger = makeLogger();
		const queue = new OrderedAckQueue(logger, {
			batchSize: 3,
			flushIntervalMs: 10_000,
		});

		const acks = [jest.fn(), jest.fn(), jest.fn()].map((fn) =>
			fn.mockResolvedValue(undefined)
		);

		queue.enqueue(Promise.resolve(true), acks[0], 'LSN/1');
		queue.enqueue(Promise.resolve(true), acks[1], 'LSN/2');
		queue.enqueue(Promise.resolve(true), acks[2], 'LSN/3');

		await queue.drain();

		// Only the last ack in the batch (highest LSN) should be called
		expect(acks[0]).not.toHaveBeenCalled();
		expect(acks[1]).not.toHaveBeenCalled();
		expect(acks[2]).toHaveBeenCalledTimes(1);
	});

	it('uses the highest-LSN ack in a batch even when an earlier event is dead-lettered', async () => {
		const logger = makeLogger();
		const queue = new OrderedAckQueue(logger, {
			batchSize: 3,
			flushIntervalMs: 10_000,
		});

		const acks = [jest.fn(), jest.fn(), jest.fn()].map((fn) =>
			fn.mockResolvedValue(undefined)
		);

		queue.enqueue(Promise.resolve(false), acks[0], 'LSN/1'); // dead-lettered
		queue.enqueue(Promise.resolve(true), acks[1], 'LSN/2');
		queue.enqueue(Promise.resolve(true), acks[2], 'LSN/3');

		await queue.drain();

		// Only the last ackFn in the batch is called — the DL event doesn't change this
		expect(acks[0]).not.toHaveBeenCalled();
		expect(acks[1]).not.toHaveBeenCalled();
		expect(acks[2]).toHaveBeenCalledTimes(1);
	});
});
