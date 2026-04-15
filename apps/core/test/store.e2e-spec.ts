import { err, ok } from '@common/interfaces/result.interface';
import { DeleteStoreUseCase } from '@modules/store/application/use-cases/delete-store.usecase';
import { GetOwnStoresUseCase } from '@modules/store/application/use-cases/get-own-stores.usecase';
import { GetPublicStoreUseCase } from '@modules/store/application/use-cases/get-public-store.usecase';
import { InitializeStoreOrchestratorUseCase } from '@modules/store/application/use-cases/initialize-store-orchestrator.usecase';
import { UpdateStoreUseCase } from '@modules/store/application/use-cases/update-store.usecase';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';

import { createTestApp } from './helpers/app.helper';
import {
	authOverrides,
	BEARER_TOKEN,
	createMockCheckPermissionUseCase,
	createMockJwtUseCase,
} from './helpers/mock-auth.helper';

const TEST_STORE_ID = '123e4567-e89b-12d3-a456-426614174000';

describe('StoreController (e2e)', () => {
	let app: INestApplication<App>;

	const mockJwtUseCase = createMockJwtUseCase();
	const mockCheckPermissionUseCase = createMockCheckPermissionUseCase();
	const mockInitializeStoreOrchestratorUseCase = { execute: jest.fn() };
	const mockGetOwnStoresUseCase = { execute: jest.fn() };
	const mockGetPublicStoreUseCase = { execute: jest.fn() };
	const mockUpdateStoreUseCase = { execute: jest.fn() };
	const mockDeleteStoreUseCase = { execute: jest.fn() };

	beforeAll(async () => {
		app = await createTestApp([
			...authOverrides(mockJwtUseCase, mockCheckPermissionUseCase),
			{
				provider: InitializeStoreOrchestratorUseCase,
				useValue: mockInitializeStoreOrchestratorUseCase,
			},
			{ provider: GetOwnStoresUseCase, useValue: mockGetOwnStoresUseCase },
			{ provider: GetPublicStoreUseCase, useValue: mockGetPublicStoreUseCase },
			{ provider: UpdateStoreUseCase, useValue: mockUpdateStoreUseCase },
			{ provider: DeleteStoreUseCase, useValue: mockDeleteStoreUseCase },
		]);
	}, 30000);

	beforeEach(() => {
		jest.clearAllMocks();
		// Re-apply default auth mock after clearAllMocks
		mockJwtUseCase.execute.mockResolvedValue(ok({ id: 'user-id' }));
	});

	afterAll(async () => {
		await app.close();
	}, 30000);

	describe('POST /stores (createStore)', () => {
		it('should return 401 if no auth token is provided', () => {
			mockJwtUseCase.execute.mockReset();
			return request(app.getHttpServer())
				.post('/stores')
				.send({ name: 'Test Store', slug: 'test-store' })
				.expect(401);
		});

		it('should return 422 if creation fails (UseCase Err)', () => {
			mockInitializeStoreOrchestratorUseCase.execute.mockResolvedValue(
				err(new Error('Validation error'))
			);

			return request(app.getHttpServer())
				.post('/stores')
				.set('Authorization', BEARER_TOKEN)
				.send({ name: 'Test Store', slug: 'test-store' })
				.expect(422);
		});

		it('should create store successfully and return 201', () => {
			mockInitializeStoreOrchestratorUseCase.execute.mockResolvedValue(
				ok({ id: 'store-id', name: 'Test Store', slug: 'test-store' })
			);

			return request(app.getHttpServer())
				.post('/stores')
				.set('Authorization', BEARER_TOKEN)
				.send({ name: 'Test Store', slug: 'test-store' })
				.expect(201)
				.expect((res) => {
					expect(res.body).toEqual({
						id: 'store-id',
						name: 'Test Store',
						slug: 'test-store',
					});
				});
		});
	});

	describe('GET /stores (getOwnStores)', () => {
		it('should return 401 if no auth token is provided', () => {
			mockJwtUseCase.execute.mockReset();
			return request(app.getHttpServer()).get('/stores').expect(401);
		});

		it('should return stores array successfully', () => {
			mockGetOwnStoresUseCase.execute.mockResolvedValue(
				ok([{ id: 'store-id', name: 'Test Store' }])
			);

			return request(app.getHttpServer())
				.get('/stores')
				.set('Authorization', BEARER_TOKEN)
				.expect(200)
				.expect((res) => {
					expect(res.body).toEqual([{ id: 'store-id', name: 'Test Store' }]);
				});
		});

		it('should return 422 if fetching own stores fails', () => {
			mockGetOwnStoresUseCase.execute.mockResolvedValue(
				err(new Error('DB Error'))
			);

			return request(app.getHttpServer())
				.get('/stores')
				.set('Authorization', BEARER_TOKEN)
				.expect(422)
				.expect((res) => {
					expect(res.body.message).toBe('DB Error');
				});
		});
	});

	describe('GET /stores/:storeId (getStoreById)', () => {
		const storeId = TEST_STORE_ID;

		it('should not require auth token (PublicRoute)', () => {
			mockGetPublicStoreUseCase.execute.mockResolvedValue(
				ok({ id: storeId, name: 'Public Store' })
			);

			return request(app.getHttpServer())
				.get(`/stores/${storeId}`)
				.expect(200)
				.expect((res) => {
					expect(res.body).toEqual({ id: storeId, name: 'Public Store' });
				});
		});

		it('should return 404 if store not found', () => {
			mockGetPublicStoreUseCase.execute.mockResolvedValue(
				err(new Error('Store not found'))
			);

			return request(app.getHttpServer()).get(`/stores/${storeId}`).expect(404);
		});
	});

	describe('PATCH /stores/:storeId (updateStore)', () => {
		const storeId = TEST_STORE_ID;

		it('should return 401 if no auth token is provided', () => {
			mockJwtUseCase.execute.mockReset();
			return request(app.getHttpServer())
				.patch(`/stores/${storeId}`)
				.send({ name: 'Updated Store' })
				.expect(401);
		});

		it('should return 403 if user lacks store.write permission', () => {
			mockCheckPermissionUseCase.execute.mockResolvedValue(ok(false));

			return request(app.getHttpServer())
				.patch(`/stores/${storeId}`)
				.set('Authorization', BEARER_TOKEN)
				.send({ name: 'Updated Store' })
				.expect(403);
		});

		it('should update store successfully and return 200', () => {
			mockCheckPermissionUseCase.execute.mockResolvedValue(ok(true));
			mockUpdateStoreUseCase.execute.mockResolvedValue(
				ok({ id: storeId, name: 'Updated Store' })
			);

			return request(app.getHttpServer())
				.patch(`/stores/${storeId}`)
				.set('Authorization', BEARER_TOKEN)
				.send({ name: 'Updated Store' })
				.expect(200)
				.expect((res) => {
					expect(res.body).toEqual({ id: storeId, name: 'Updated Store' });
				});
		});

		it('should return 404 if store update fails', () => {
			mockCheckPermissionUseCase.execute.mockResolvedValue(ok(true));
			mockUpdateStoreUseCase.execute.mockResolvedValue(
				err(new Error('Not found'))
			);

			return request(app.getHttpServer())
				.patch(`/stores/${storeId}`)
				.set('Authorization', BEARER_TOKEN)
				.send({ name: 'Updated Store' })
				.expect(404);
		});
	});

	describe('DELETE /stores/:storeId (deleteStore)', () => {
		const storeId = TEST_STORE_ID;

		it('should return 401 if no auth token is provided', () => {
			mockJwtUseCase.execute.mockReset();
			return request(app.getHttpServer())
				.delete(`/stores/${storeId}`)
				.expect(401);
		});

		it('should return 403 if user lacks store.delete permission', () => {
			mockCheckPermissionUseCase.execute.mockResolvedValue(ok(false));

			return request(app.getHttpServer())
				.delete(`/stores/${storeId}`)
				.set('Authorization', BEARER_TOKEN)
				.expect(403);
		});

		it('should delete store successfully and return 204 No Content', () => {
			mockCheckPermissionUseCase.execute.mockResolvedValue(ok(true));
			mockDeleteStoreUseCase.execute.mockResolvedValue(ok(undefined));

			return request(app.getHttpServer())
				.delete(`/stores/${storeId}`)
				.set('Authorization', BEARER_TOKEN)
				.expect(204)
				.expect((res) => {
					expect(res.body).toEqual({});
				});
		});

		it('should return 404 if store deletion fails', () => {
			mockCheckPermissionUseCase.execute.mockResolvedValue(ok(true));
			mockDeleteStoreUseCase.execute.mockResolvedValue(
				err(new Error('Not found'))
			);

			return request(app.getHttpServer())
				.delete(`/stores/${storeId}`)
				.set('Authorization', BEARER_TOKEN)
				.expect(404);
		});
	});
});
