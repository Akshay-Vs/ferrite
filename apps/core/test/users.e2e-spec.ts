import { err, ok } from '@common/interfaces/result.interface';
import { PlatformRoles } from '@ferrite/schema/common/platform-roles.zodschema';
import type { INestApplication } from '@nestjs/common';
import { MissingAuthProviderError } from '@users/domain/errors/missing-auth-provider.error';
import { UserNotFoundError } from '@users/domain/errors/user-not-found.error';
import {
	GET_ALL_USERS_UC,
	GET_OWN_PROFILE_UC,
	GET_USER_BY_ID_UC,
	INITIATE_DELETE_USER_UC,
	INITIATE_PROFILE_UPDATE_UC,
	INITIATE_ROLE_UPDATE_UC,
} from '@users/domain/ports/use-cases.port';
import request from 'supertest';
import type { App } from 'supertest/types';

import { createTestApp } from './helpers/app.helper';
import {
	authOverrides,
	BEARER_TOKEN,
	createMockCheckPermissionUseCase,
	createMockJwtUseCase,
} from './helpers/mock-auth.helper';

describe('UserController (e2e)', () => {
	let app: INestApplication<App>;

	const mockJwtUseCase = createMockJwtUseCase();
	const mockCheckPermissionUseCase = createMockCheckPermissionUseCase();

	const mockGetOwnProfileUseCase = { execute: jest.fn() };
	const mockUpdateOwnProfileUseCase = { execute: jest.fn() };
	const mockInitiatedeleteUserUseCase = { execute: jest.fn() };
	const mockGetAllUsersUseCase = { execute: jest.fn() };
	const mockGetUserByIdUseCase = { execute: jest.fn() };
	const mockUpdateRoleUseCase = { execute: jest.fn() };

	beforeAll(async () => {
		app = await createTestApp([
			...authOverrides(mockJwtUseCase, mockCheckPermissionUseCase),
			{ provider: GET_OWN_PROFILE_UC, useValue: mockGetOwnProfileUseCase },
			{
				provider: INITIATE_PROFILE_UPDATE_UC,
				useValue: mockUpdateOwnProfileUseCase,
			},
			{
				provider: INITIATE_DELETE_USER_UC,
				useValue: mockInitiatedeleteUserUseCase,
			},
			{ provider: GET_ALL_USERS_UC, useValue: mockGetAllUsersUseCase },
			{ provider: GET_USER_BY_ID_UC, useValue: mockGetUserByIdUseCase },
			{ provider: INITIATE_ROLE_UPDATE_UC, useValue: mockUpdateRoleUseCase },
		]);
	}, 30000);

	beforeEach(() => {
		jest.clearAllMocks();
		// Re-apply default auth mock after clearAllMocks
		mockJwtUseCase.execute.mockResolvedValue(
			ok({ id: 'user-id', role: PlatformRoles.USER })
		);
	});

	afterAll(async () => {
		await app.close();
	}, 30000);

	describe('GET /users/me', () => {
		it('should return 401 if no auth token is provided', () => {
			mockJwtUseCase.execute.mockReset();
			return request(app.getHttpServer()).get('/users/me').expect(401);
		});

		it('should return 404 if profile not found', () => {
			mockGetOwnProfileUseCase.execute.mockResolvedValue(
				err(new UserNotFoundError('user-id'))
			);

			return request(app.getHttpServer())
				.get('/users/me')
				.set('Authorization', BEARER_TOKEN)
				.expect(404);
		});

		it('should return profile successfully and return 200', () => {
			const mockProfile = { id: 'user-id', firstName: 'John' };
			mockGetOwnProfileUseCase.execute.mockResolvedValue(ok(mockProfile));

			return request(app.getHttpServer())
				.get('/users/me')
				.set('Authorization', BEARER_TOKEN)
				.expect(200)
				.expect((res) => {
					expect(res.body).toEqual(mockProfile);
				});
		});
	});

	describe('PATCH /users/me', () => {
		it('should return 401 if no auth token is provided', () => {
			mockJwtUseCase.execute.mockReset();
			return request(app.getHttpServer())
				.patch('/users/me')
				.send({ firstName: 'Jane' })
				.expect(401);
		});

		it('should return 404 if profile update fails (User not found)', () => {
			mockUpdateOwnProfileUseCase.execute.mockResolvedValue(
				err(new UserNotFoundError('user-id'))
			);

			return request(app.getHttpServer())
				.patch('/users/me')
				.set('Authorization', BEARER_TOKEN)
				.send({ firstName: 'Jane' })
				.expect(404);
		});

		it('should update profile successfully and return 200', () => {
			const mockResponse = { id: 'user-id', firstName: 'Jane' };
			mockUpdateOwnProfileUseCase.execute.mockResolvedValue(ok(mockResponse));

			return request(app.getHttpServer())
				.patch('/users/me')
				.set('Authorization', BEARER_TOKEN)
				.send({ firstName: 'Jane' })
				.expect(200)
				.expect((res) => {
					expect(res.body).toEqual(mockResponse);
				});
		});
	});

	describe('DELETE /users/me', () => {
		it('should return 401 if no auth token is provided', () => {
			mockJwtUseCase.execute.mockReset();
			return request(app.getHttpServer()).delete('/users/me').expect(401);
		});

		it('should return 404 if delete fails (User not found)', () => {
			mockInitiatedeleteUserUseCase.execute.mockResolvedValue(
				err(new UserNotFoundError('user-id'))
			);

			return request(app.getHttpServer())
				.delete('/users/me')
				.set('Authorization', BEARER_TOKEN)
				.expect(404);
		});

		it('should delete profile successfully and return 200', () => {
			mockInitiatedeleteUserUseCase.execute.mockResolvedValue(ok(undefined));

			return request(app.getHttpServer())
				.delete('/users/me')
				.set('Authorization', BEARER_TOKEN)
				.expect(200)
				.expect((res) => {
					expect(res.body).toEqual({});
				});
		});
	});

	describe('GET /users', () => {
		beforeEach(() => {
			mockJwtUseCase.execute.mockResolvedValue(
				ok({ id: 'admin-id', role: PlatformRoles.STAFF })
			);
		});

		it('should return 401 if no auth token is provided', () => {
			mockJwtUseCase.execute.mockReset();
			return request(app.getHttpServer()).get('/users').expect(401);
		});

		it('should return 403 if user lacks STAFF role', () => {
			mockJwtUseCase.execute.mockResolvedValue(
				ok({ id: 'user-id', role: PlatformRoles.USER })
			);
			return request(app.getHttpServer())
				.get('/users')
				.set('Authorization', BEARER_TOKEN)
				.expect(403);
		});

		it('should return 500 if use case fails', () => {
			mockGetAllUsersUseCase.execute.mockResolvedValue(
				err(new Error('DB Error'))
			);

			return request(app.getHttpServer())
				.get('/users')
				.set('Authorization', BEARER_TOKEN)
				.expect(500);
		});

		it('should return users array successfully', () => {
			const mockUsers = { items: [{ id: 'user-id' }] };
			mockGetAllUsersUseCase.execute.mockResolvedValue(ok(mockUsers));

			return request(app.getHttpServer())
				.get('/users')
				.set('Authorization', BEARER_TOKEN)
				.expect(200)
				.expect((res) => {
					expect(res.body).toEqual(mockUsers);
				});
		});
	});

	describe('GET /users/:id', () => {
		beforeEach(() => {
			mockJwtUseCase.execute.mockResolvedValue(
				ok({ id: 'admin-id', role: PlatformRoles.STAFF })
			);
		});

		const testUserId = '123e4567-e89b-12d3-a456-426614174000';

		it('should return 401 if no auth token is provided', () => {
			mockJwtUseCase.execute.mockReset();
			return request(app.getHttpServer())
				.get(`/users/${testUserId}`)
				.expect(401);
		});

		it('should return 403 if user lacks STAFF role', () => {
			mockJwtUseCase.execute.mockResolvedValue(
				ok({ id: 'user-id', role: PlatformRoles.USER })
			);
			return request(app.getHttpServer())
				.get(`/users/${testUserId}`)
				.set('Authorization', BEARER_TOKEN)
				.expect(403);
		});

		it('should return 404 if user not found', () => {
			mockGetUserByIdUseCase.execute.mockResolvedValue(
				err(new UserNotFoundError(testUserId))
			);

			return request(app.getHttpServer())
				.get(`/users/${testUserId}`)
				.set('Authorization', BEARER_TOKEN)
				.expect(404);
		});

		it('should return 500 if usecase fails with other error', () => {
			mockGetUserByIdUseCase.execute.mockResolvedValue(
				err(new Error('Internal Server Error'))
			);

			return request(app.getHttpServer())
				.get(`/users/${testUserId}`)
				.set('Authorization', BEARER_TOKEN)
				.expect(500);
		});

		it('should return user successfully and return 200', () => {
			const mockUser = { id: testUserId, firstName: 'John' };
			mockGetUserByIdUseCase.execute.mockResolvedValue(ok(mockUser));

			return request(app.getHttpServer())
				.get(`/users/${testUserId}`)
				.set('Authorization', BEARER_TOKEN)
				.expect(200)
				.expect((res) => {
					expect(res.body).toEqual(mockUser);
				});
		});
	});

	describe('PATCH /users/:id/role', () => {
		beforeEach(() => {
			mockJwtUseCase.execute.mockResolvedValue(
				ok({ id: 'admin-id', role: PlatformRoles.ADMIN })
			);
		});

		const testUserId = '123e4567-e89b-12d3-a456-426614174000';

		it('should return 401 if no auth token is provided', () => {
			mockJwtUseCase.execute.mockReset();
			return request(app.getHttpServer())
				.patch(`/users/${testUserId}/role`)
				.send({ role: PlatformRoles.STAFF })
				.expect(401);
		});

		it('should return 403 if user lacks ADMIN role', () => {
			mockJwtUseCase.execute.mockResolvedValue(
				ok({ id: 'staff-id', role: PlatformRoles.STAFF })
			);
			return request(app.getHttpServer())
				.patch(`/users/${testUserId}/role`)
				.set('Authorization', BEARER_TOKEN)
				.send({ role: PlatformRoles.STAFF })
				.expect(403);
		});

		it('should return 404 if user not found', () => {
			mockUpdateRoleUseCase.execute.mockResolvedValue(
				err(new UserNotFoundError(testUserId))
			);

			return request(app.getHttpServer())
				.patch(`/users/${testUserId}/role`)
				.set('Authorization', BEARER_TOKEN)
				.send({ role: PlatformRoles.STAFF })
				.expect(404);
		});

		it('should return 422 if missing auth provider', () => {
			mockUpdateRoleUseCase.execute.mockResolvedValue(
				err(new MissingAuthProviderError(testUserId))
			);

			return request(app.getHttpServer())
				.patch(`/users/${testUserId}/role`)
				.set('Authorization', BEARER_TOKEN)
				.send({ role: PlatformRoles.STAFF })
				.expect(422);
		});

		it('should return 500 if use case fails with other error', () => {
			mockUpdateRoleUseCase.execute.mockResolvedValue(
				err(new Error('Internal Server Error'))
			);

			return request(app.getHttpServer())
				.patch(`/users/${testUserId}/role`)
				.set('Authorization', BEARER_TOKEN)
				.send({ role: PlatformRoles.STAFF })
				.expect(500);
		});

		it('should update role successfully and return 200', () => {
			const mockResponse = { id: testUserId, role: PlatformRoles.STAFF };
			mockUpdateRoleUseCase.execute.mockResolvedValue(ok(mockResponse));

			return request(app.getHttpServer())
				.patch(`/users/${testUserId}/role`)
				.set('Authorization', BEARER_TOKEN)
				.send({ role: PlatformRoles.STAFF })
				.expect(200)
				.expect((res) => {
					expect(res.body).toEqual(mockResponse);
				});
		});
	});
});
