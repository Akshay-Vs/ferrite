import type { StorefrontEmailVerificationTable } from '@core/database/schema/storefront-user.schema';
import {
	type CreateEmailVerificationInput,
	type EmailVerification,
	emailVerificationSchema,
} from '@ferrite/schema/storefront-auth/email-verification.zodschema';

export class EmailVerificationMapper {
	static toDomain(row: StorefrontEmailVerificationTable): EmailVerification {
		return emailVerificationSchema.parse({ ...row });
	}

	static toPersistence(
		data: CreateEmailVerificationInput
	): CreateEmailVerificationInput {
		return { ...data };
	}
}
