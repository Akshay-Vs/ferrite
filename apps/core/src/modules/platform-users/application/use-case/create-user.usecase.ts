import { err, ok, Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { EventPayload } from '@ferrite/schema/common/event-payload.zodschema';
import { webhookEnvelopeSchema } from '@ferrite/schema/common/webhook-envelope.zodschema';
import {
	type UserCreatedEvent,
	userCreatedEventSchema,
} from '@ferrite/schema/users/user-created.zodschema';
import { UserConflictError } from '@modules/platform-users/domain/errors/user-conflict.error';
import { UserExistsError } from '@modules/platform-users/domain/errors/user-exists.error';
import type { ICreateUserUseCase } from '@modules/platform-users/domain/ports/use-cases.port';
import {
	type IUserRepository,
	USER_REPOSITORY,
} from '@modules/platform-users/domain/ports/user-repository.port';
import {
	type IWebhookMapperRegistry,
	WEBHOOK_MAPPER_REGISTRY,
} from '@modules/platform-users/domain/ports/webhook-mapper.registry.port';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CreateUserUseCase implements ICreateUserUseCase {
	constructor(
		@Inject(USER_REPOSITORY) private readonly repo: IUserRepository,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger,
		@Inject(WEBHOOK_MAPPER_REGISTRY)
		private readonly registry: IWebhookMapperRegistry
	) {
		this.logger.setContext(this.constructor.name);
	}

	private async parsePayload(payload: EventPayload): Promise<UserCreatedEvent> {
		// Parse raw payload
		const parsedPayload = await webhookEnvelopeSchema.parseAsync(payload);

		// Map external payload to standard event candidate
		const mapper = this.registry.resolve(parsedPayload.provider);
		const mapped = mapper.map(parsedPayload);

		if (!mapped || mapped.eventType !== 'user.created') {
			throw new Error(
				`Invalid webhook payload or unsupported event type ${payload.eventType}
        `
			);
		}

		// Parse standard event candidate
		const userCreatedEvent = await userCreatedEventSchema.parseAsync(mapped);
		return userCreatedEvent;
	}

	async execute(
		payload: EventPayload
	): Promise<Result<void, UserExistsError | UserConflictError | Error>> {
		return this.tracer.withSpan('use-case.create-user', async () => {
			try {
				// Validate payload and existing user
				const userCreatedEvent = await this.parsePayload(payload);
				const existing = await this.repo.findById(userCreatedEvent.id);

				if (existing) {
					this.logger.warn(`User already exists: eventId=${payload.eventId}`);
					return err(new UserExistsError(payload.eventId));
				}

				// Create user
				await this.repo.createWithAuth(userCreatedEvent);
				this.logger.debug(`User created: id=${userCreatedEvent.id}`);

				return ok();
			} catch (error: any) {
				// 23505 is the Postgres error code for unique_violation
				if (error?.code === '23505' || error?.cause?.code === '23505') {
					this.logger.warn(
						`User creation conflict (potentially soft-deleted PK): eventId=${payload.eventId}`
					);
					return err(new UserConflictError(payload.eventId));
				}

				this.logger.error(
					`Failed to create user: eventId=${payload.eventId}`,
					error //? error.stack : String(error)
				);
				return err(error instanceof Error ? error : new Error(String(error)));
			}
		});
	}
}
