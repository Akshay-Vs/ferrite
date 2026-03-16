import type { NewUser } from '@core/database/schema/user.schema';
import { UserCreatedEvent } from '@users/domain/schemas/user-created.zodschema';
import { UserUpdatedEvent } from '@users/domain/schemas/user-updated.zodschema';

/**
 * Maps provider-agnostic user events to Drizzle insert/update objects.
 */
export class UserMapper {
	static toNewUser(event: UserCreatedEvent): NewUser {
		return {
			email: event.email,
			emailVerified: event.emailVerified,
			firstName: event.firstName,
			lastName: event.lastName,
			avatarUrl: event.avatarUrl,
			isActive: true,
			isBanned: event.banned,
		};
	}

	static toUserUpdate(event: UserUpdatedEvent): Partial<Omit<NewUser, 'id'>> {
		const update: Record<string, unknown> = {};

		if (event.email !== undefined) update.email = event.email;
		if (event.emailVerified !== undefined)
			update.emailVerified = event.emailVerified;
		if (event.firstName !== undefined) update.firstName = event.firstName;
		if (event.lastName !== undefined) update.lastName = event.lastName;
		if (event.avatarUrl !== undefined) update.avatarUrl = event.avatarUrl;
		if (event.banned !== undefined) update.isBanned = event.banned;

		update.updatedAt = new Date();

		return update;
	}
}
