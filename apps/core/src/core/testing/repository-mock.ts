/// <reference types="jest" />
import { DrizzleUnitOfWork } from '@core/database/drizzle-unit-of-work';

export function createDrizzleQueryBuilderMock() {
	return {
		select: jest.fn().mockReturnThis(),
		from: jest.fn().mockReturnThis(),
		where: jest.fn().mockReturnThis(),
		limit: jest.fn(),
		update: jest.fn().mockReturnThis(),
		set: jest.fn().mockReturnThis(),
		insert: jest.fn().mockReturnThis(),
		values: jest.fn().mockReturnThis(),
		returning: jest.fn(),
		delete: jest.fn().mockReturnThis(),
	};
}

export function createTracerMock() {
	return {
		withSpan: jest.fn(async (_name, fn) => await fn()),
	};
}

export function createUowMock() {
	return {
		execute: jest.fn(async (fn) => await fn('mock_tx_context')),
	};
}

export function setupDrizzleUowMock(mockQueryBuilder: any) {
	return jest
		.spyOn(DrizzleUnitOfWork, 'unwrap')
		.mockReturnValue(mockQueryBuilder as any);
}
