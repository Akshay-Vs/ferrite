import { type IUpdateUser } from '@auth/domain/ports/auth-provider.port';
import { AUTH_PROVIDER } from '@auth/domain/ports/auth-provider.tokens';
import { UserUpdatePayload } from '@auth/index';
import { err, ok, Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer, OTEL_TRACER } from '@core/tracer';
import { EventPayload } from '@ferrite/schema/common/event-payload.zodschema';
import { userUpdatedEventSchema } from '@ferrite/schema/users/index';
import { Inject, Injectable } from '@nestjs/common';
import { ISyncUserProfileUpdateUseCase } from '@users/domain/ports/use-cases.port';

@Injectable()
export class SyncProfileUpdateUseCase implements ISyncUserProfileUpdateUseCase {
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

				// patch with only the fields that are mapped
				const patch: UserUpdatePayload = {};

				if (validatedEvent.firstName !== undefined) {
					patch.firstName = validatedEvent.firstName;
				}

				if (validatedEvent.lastName !== undefined) {
					patch.lastName = validatedEvent.lastName;
				}

				if (validatedEvent.publicMetadata?.role !== undefined) {
					patch.publicMetadata = {
						role: validatedEvent.publicMetadata.role,
					};
				}

				// if no patch, skip
				if (Object.keys(patch).length === 0) {
					this.logger.debug(
						`No mapped profile fields in event; skipping sync: id=${validatedEvent.externalAuthId}`
					);
					return ok();
				}

				await this.authProvider.updateUser(
					validatedEvent.externalAuthId,
					patch
				);

				this.logger.debug(
					`User updated successfully: id=${validatedEvent.externalAuthId}`
				);

				return ok();
			} catch (error) {
				const errObj =
					error instanceof Error ? error : new Error(String(error));
				this.logger.error(`Failed to update user: ${errObj.message}`);
				return err(errObj);
			}
		});
	}
}
