import type {
	NewStorefrontUserTable,
	StorefrontUserTable,
} from '@core/database/schema/storefront-user.schema';
import {
	type StorefrontUser,
	StorefrontUserSchema,
} from '../../../domain/schemas/storefront-user.zodschema';

export class StorefrontUserMapper {
	static toDomain(row: StorefrontUserTable): StorefrontUser {
		return StorefrontUserSchema.parse({
			...row,
		});
	}

	static toPersistenceCreate(
		data: NewStorefrontUserTable
	): NewStorefrontUserTable {
		return {
			...data,
			email: StorefrontUserMapper.normalizeEmail(data.email),
		};
	}

	static normalizeEmail(email: string): string {
		return email.toLowerCase();
	}
}
