import { type IDeleteUser } from '@auth/domain/ports/auth-provider.port';
import { AUTH_PROVIDER } from '@auth/domain/ports/auth-provider.tokens';
import { err, ok, Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { EventPayload } from '@ferrite/schema/common/event-payload.zodschema';
import { userDeletedEventSchema } from '@ferrite/schema/users/user-deleted.zodschema';
import { Inject, Injectable } from '@nestjs/common';
import { ISyncUserDeletionUseCase } from '@users/domain/ports/use-cases.port';

@Injectable()
export class SyncUserDeletionUseCase implements ISyncUserDeletionUseCase {
	constructor(
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		@Inject(AUTH_PROVIDER) private readonly authProvider: IDeleteUser,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(event: EventPayload): Promise<Result<void, Error>> {
		return this.tracer.withSpan('use-case.sync-user-deletion', async () => {
			this.logger.debug('Processing secondary delete effect from queue');

			try {
				// Parse payload
				const parsedPayload = await userDeletedEventSchema.parseAsync(
					event.payload
				);

				// Call external provider to delete user
				await this.authProvider.deleteUser(parsedPayload.externalAuthId);
				this.logger.debug(
					`User deleted successfully: eventId=${event.eventId}`
				);
				return ok();
			} catch (e: any) {
				this.logger.error('Failed to process user deletion event', e);
				return err(e instanceof Error ? e : new Error(String(e)));
			}
		});
	}
}
