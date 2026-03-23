import { type IUpdateUser } from '@auth/domain/ports/auth-provider.port';
import { AUTH_PROVIDER } from '@auth/domain/ports/auth-provider.tokens';
import { err, ok, Result } from '@common/interfaces/result.interface';
import { EventPayload } from '@common/schemas/event-payload.zodschema';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer, OTEL_TRACER } from '@core/tracer';
import { Inject, Injectable } from '@nestjs/common';
import { ISyncUserDeletionUseCase } from '@users/domain/ports/use-cases.port';
import { userUpdatedEventSchema } from '@users/domain/schemas';

@Injectable()
export class SyncProfileUpdateUseCase implements ISyncUserDeletionUseCase {
	constructor(
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		@Inject(AUTH_PROVIDER) private readonly authProvider: IUpdateUser,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(input: EventPayload): Promise<Result<void, Error>> {
		return this.tracer.withSpan('use-case.sync-user-update', async () => {
			this.logger.debug('Processing secondary update effect from queue');

			try {
				const validatedEvent = await userUpdatedEventSchema.parseAsync(
					input.payload
				);

				setTimeout(async () => {
					await this.authProvider.updateUser(validatedEvent.externalAuthId, {
						firstName: validatedEvent.firstName,
						lastName: validatedEvent.lastName,
						publicMetadata: {
							role: validatedEvent.publicMetadata?.role,
						},
					});
				}, 5000);

				this.logger.debug(
					`User updated successfully: id=${validatedEvent.externalAuthId}`
				);

				return ok();
			} catch (error) {
				return err(error);
			}
		});
	}
}
