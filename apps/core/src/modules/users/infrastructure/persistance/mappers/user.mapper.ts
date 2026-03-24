import type { NewUser, User } from '@core/database/schema/user.schema';
import { UserCreatedEvent } from '@users/domain/schemas/user-created.zodschema';
import type {
	UserProfileBase,
	UserProfileFull,
} from '@users/domain/schemas/user-profile.zodschema';
import { UserUpdatedEvent } from '@users/domain/schemas/user-updated.zodschema';

/**
 * Maps provider-agnostic user events to Drizzle insert/update objects.
 */
export class UserMapper {
	static toNewUser(event: UserCreatedEvent): NewUser {
		return {
			id: event.id,
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

		if (event.firstName !== undefined) update.firstName = event.firstName;
		if (event.lastName !== undefined) update.lastName = event.lastName;

		update.updatedAt = new Date();

		return update;
	}

	static toUserProfile(user: User): UserProfileFull {
		return {
			id: user.id,
			email: user.email,
			emailVerified: user.emailVerified,
			firstName: user.firstName,
			lastName: user.lastName,
			avatarUrl: user.avatarUrl,
			dateOfBirth: user.dateOfBirth,
			preferredLocale: user.preferredLocale?.toLowerCase() ?? null,
			preferredCurrency: user.preferredCurrency?.toUpperCase() ?? null,
			isActive: user.isActive,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};
	}

	static toBaseUserProfile(user: User): UserProfileBase {
		return {
			id: user.id,
			email: user.email,
			emailVerified: user.emailVerified,
			firstName: user.firstName,
			lastName: user.lastName,
			avatarUrl: user.avatarUrl,
			isActive: user.isActive,
		};
	}
}
