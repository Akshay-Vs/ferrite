import { err, ok } from '@common/interfaces/result.interface';
import { InvalidStepTransitionError } from '@modules/onboarding/domain/errors/invalid-step-transition.error';
import { OnboardingAlreadyCompletedError } from '@modules/onboarding/domain/errors/onboarding-already-completed.error';
import {
	GET_ONBOARDING_SESSION_UC,
	SUBMIT_ABOUT_ME_UC,
	SUBMIT_STORE_CREATION_UC,
} from '@modules/onboarding/domain/ports/use-cases.port';
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

describe('OnboardingController (e2e)', () => {
	let app: INestApplication<App>;

	const mockJwtUseCase = createMockJwtUseCase();
	const mockCheckPermissionUseCase = createMockCheckPermissionUseCase();
	const mockGetSessionUc = { execute: jest.fn() };
	const mockSubmitAboutMeUc = { execute: jest.fn() };
	const mockSubmitStoreCreationUc = { execute: jest.fn() };

	beforeAll(async () => {
		app = await createTestApp([
			...authOverrides(mockJwtUseCase, mockCheckPermissionUseCase),
			{
				provider: GET_ONBOARDING_SESSION_UC,
				useValue: mockGetSessionUc,
			},
			{
				provider: SUBMIT_ABOUT_ME_UC,
				useValue: mockSubmitAboutMeUc,
			},
			{
				provider: SUBMIT_STORE_CREATION_UC,
				useValue: mockSubmitStoreCreationUc,
			},
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

	describe('GET /onboarding/session', () => {
		it('should return 401 if no auth token is provided', () => {
			mockJwtUseCase.execute.mockReset();
			return request(app.getHttpServer())
				.get('/onboarding/session')
				.expect(401);
		});

		it('should return 500 if getting session fails (UseCase Err)', () => {
			mockGetSessionUc.execute.mockResolvedValue(
				err(new Error('Internal Server Error'))
			);

			return request(app.getHttpServer())
				.get('/onboarding/session')
				.set('Authorization', BEARER_TOKEN)
				.expect(500);
		});

		it('should return session successfully and return 200', () => {
			const mockSession = { step: 'ABOUT_ME', status: 'IN_PROGRESS' };
			mockGetSessionUc.execute.mockResolvedValue(ok(mockSession));

			return request(app.getHttpServer())
				.get('/onboarding/session')
				.set('Authorization', BEARER_TOKEN)
				.expect(200)
				.expect((res) => {
					expect(res.body).toEqual(mockSession);
				});
		});
	});

	describe('POST /onboarding/steps/about-me', () => {
		it('should return 401 if no auth token is provided', () => {
			mockJwtUseCase.execute.mockReset();
			return request(app.getHttpServer())
				.post('/onboarding/steps/about-me')
				.send({ firstName: 'John', lastName: 'Doe' })
				.expect(401);
		});

		it('should return 409 if InvalidStepTransitionError', () => {
			mockSubmitAboutMeUc.execute.mockResolvedValue(
				err(new InvalidStepTransitionError('ABOUT_ME', 'STORE_CREATION'))
			);

			return request(app.getHttpServer())
				.post('/onboarding/steps/about-me')
				.set('Authorization', BEARER_TOKEN)
				.send({ firstName: 'John', lastName: 'Doe' })
				.expect(409);
		});

		it('should return 409 if OnboardingAlreadyCompletedError', () => {
			mockSubmitAboutMeUc.execute.mockResolvedValue(
				err(new OnboardingAlreadyCompletedError())
			);

			return request(app.getHttpServer())
				.post('/onboarding/steps/about-me')
				.set('Authorization', BEARER_TOKEN)
				.send({ firstName: 'John', lastName: 'Doe' })
				.expect(409);
		});

		it('should return 500 if usecase fails with other error', () => {
			mockSubmitAboutMeUc.execute.mockResolvedValue(err(new Error('DB Error')));

			return request(app.getHttpServer())
				.post('/onboarding/steps/about-me')
				.set('Authorization', BEARER_TOKEN)
				.send({ firstName: 'John', lastName: 'Doe' })
				.expect(500);
		});

		it('should submit about-me successfully and return 200', () => {
			const mockResponse = { step: 'STORE_CREATION', status: 'IN_PROGRESS' };
			mockSubmitAboutMeUc.execute.mockResolvedValue(ok(mockResponse));

			return request(app.getHttpServer())
				.post('/onboarding/steps/about-me')
				.set('Authorization', BEARER_TOKEN)
				.send({ firstName: 'John', lastName: 'Doe' })
				.expect(200)
				.expect((res) => {
					expect(res.body).toEqual(mockResponse);
				});
		});
	});

	describe('POST /onboarding/steps/store-creation', () => {
		it('should return 401 if no auth token is provided', () => {
			mockJwtUseCase.execute.mockReset();
			return request(app.getHttpServer())
				.post('/onboarding/steps/store-creation')
				.send({
					name: 'My Store',
					description: 'A store',
					currencyCode: 'USD',
					storeIcon: 'store',
				})
				.expect(401);
		});

		it('should return 409 if InvalidStepTransitionError', () => {
			mockSubmitStoreCreationUc.execute.mockResolvedValue(
				err(new InvalidStepTransitionError('STORE_CREATION', 'COMPLETED'))
			);

			return request(app.getHttpServer())
				.post('/onboarding/steps/store-creation')
				.set('Authorization', BEARER_TOKEN)
				.send({
					name: 'My Store',
					description: 'A store',
					currencyCode: 'USD',
					storeIcon: 'store',
				})
				.expect(409);
		});

		it('should return 409 if OnboardingAlreadyCompletedError', () => {
			mockSubmitStoreCreationUc.execute.mockResolvedValue(
				err(new OnboardingAlreadyCompletedError())
			);

			return request(app.getHttpServer())
				.post('/onboarding/steps/store-creation')
				.set('Authorization', BEARER_TOKEN)
				.send({
					name: 'My Store',
					description: 'A store',
					currencyCode: 'USD',
					storeIcon: 'store',
				})
				.expect(409);
		});

		it('should return 500 if usecase fails with other error', () => {
			mockSubmitStoreCreationUc.execute.mockResolvedValue(
				err(new Error('DB Error'))
			);

			return request(app.getHttpServer())
				.post('/onboarding/steps/store-creation')
				.set('Authorization', BEARER_TOKEN)
				.send({
					name: 'My Store',
					description: 'A store',
					currencyCode: 'USD',
					storeIcon: 'store',
				})
				.expect(500);
		});

		it('should submit store-creation successfully and return 200', () => {
			const mockResponse = { step: 'COMPLETED', status: 'COMPLETED' };
			mockSubmitStoreCreationUc.execute.mockResolvedValue(ok(mockResponse));

			return request(app.getHttpServer())
				.post('/onboarding/steps/store-creation')
				.set('Authorization', BEARER_TOKEN)
				.send({
					name: 'My Store',
					description: 'A store',
					currencyCode: 'USD',
					storeIcon: 'store',
				})
				.expect(200)
				.expect((res) => {
					expect(res.body).toEqual(mockResponse);
				});
		});
	});
});
