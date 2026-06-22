import type { StorefrontUserTable } from '@core/database/schema/storefront-user.schema';
import {
	CreateStorefrontUserInput,
	StorefrontUser,
	StorefrontUserResponse,
	storefrontUserSchema,
} from '@ferrite/schema/storefront-auth/storefront-user.zodschema';

export class StorefrontUserMapper {
	static toDomain(row: StorefrontUserTable): StorefrontUser {
		return storefrontUserSchema.parse({
			...row,
		});
	}

	static toPersistenceCreate(
		data: CreateStorefrontUserInput
	): CreateStorefrontUserInput {
		return {
			...data,
			email: StorefrontUserMapper.normalizeEmail(data.email),
		};
	}

	static normalizeEmail(email: string): string {
		return email.toLowerCase();
	}

	static formatResponse(row: StorefrontUser): StorefrontUserResponse {
		return {
			id: row.id,
			email: row.email,
			displayName: row.displayName,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
			emailVerified: row.emailVerifiedAt !== null,
			mfaEnabled: row.mfaEnabled,
			metadata: row.metadata,
			storeId: row.storeId,
		};
	}
}
