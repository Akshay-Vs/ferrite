import type { StorefrontUserTable } from '@core/database/schema/storefront-user.schema';
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
}
