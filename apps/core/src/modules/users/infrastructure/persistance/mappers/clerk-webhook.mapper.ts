import { WebhookPayload } from '@auth/index';
import { AppLogger } from '@core/logger/logger.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { IWebhookMapper } from '@users/domain/ports/webhook-mapper.port';
import { UserSyncEvent } from '@users/domain/schemas/user-sync-event.zodschema';

@Injectable()
export class ClerkWebhookMapper implements IWebhookMapper {
	readonly provider = 'clerk';

	constructor(private readonly logger: AppLogger) {}

	map(payload: WebhookPayload): UserSyncEvent | null {
		const { eventType, data } = payload;
		const externalAuthId = data.id as string;
		const provider = 'clerk';

		this.logger.log(
			`Mapping Clerk webhook event ${eventType} to UserSyncEvent`
		);

		switch (eventType) {
			case 'user.created':
				return {
					eventType: 'user.created',
					externalAuthId,
					provider,
					oauthProvider: this.extractOauthProvider(data),
					email: this.extractPrimaryEmail(data),
					emailVerified: this.extractEmailVerified(data),
					phoneNumber: this.extractPrimaryPhone(data),
					phoneVerified: this.extractPhoneVerified(data),
					username: (data.username as string) ?? null,
					firstName: (data.first_name as string) ?? null,
					lastName: (data.last_name as string) ?? null,
					avatarUrl: (data.image_url as string) ?? null,
					locale: (data.locale as string) ?? null,
					twoFactorEnabled: (data.two_factor_enabled as boolean) ?? false,
					banned: (data.banned as boolean) ?? false,
					locked: (data.locked as boolean) ?? false,
					providerCreatedAt: data.created_at as number,
					providerUpdatedAt: data.updated_at as number,
					lastSignInAt: (data.last_sign_in_at as number) ?? null,
				};

			case 'user.updated':
				return {
					eventType: 'user.updated',
					externalAuthId,
					provider,
					oauthProvider: this.extractOauthProvider(data),
					email: this.extractPrimaryEmail(data),
					emailVerified: this.extractEmailVerified(data),
					phoneNumber: this.extractPrimaryPhone(data),
					phoneVerified: this.extractPhoneVerified(data),
					username: (data.username as string) ?? null,
					firstName: (data.first_name as string) ?? null,
					lastName: (data.last_name as string) ?? null,
					avatarUrl: (data.image_url as string) ?? null,
					locale: (data.locale as string) ?? null,
					twoFactorEnabled: (data.two_factor_enabled as boolean) ?? false,
					banned: (data.banned as boolean) ?? false,
					locked: (data.locked as boolean) ?? false,
					providerCreatedAt: data.created_at as number,
					providerUpdatedAt: data.updated_at as number,
					lastSignInAt: (data.last_sign_in_at as number) ?? null,
				};

			case 'user.deleted':
				return {
					eventType: 'user.deleted',
					externalAuthId,
					provider,
				};
			default:
				return null;
		}
	}

	private extractPrimaryEmail(data: Record<string, unknown>): string {
		const addresses = data.email_addresses as
			| Array<{ id: string; email_address: string }>
			| undefined;
		const primaryId = data.primary_email_address_id as string | undefined;

		if (!addresses?.length) {
			this.logger.error('No email addresses found');
			throw new BadRequestException('No email addresses found');
		}

		const primary = primaryId
			? addresses.find((a) => a.id === primaryId)
			: addresses[0];

		const email = primary?.email_address ?? addresses[0]?.email_address;

		if (!email) {
			this.logger.error('No email addresses found');
			throw new BadRequestException('No email addresses found');
		}

		return primary?.email_address ?? addresses[0]?.email_address ?? null;
	}

	private extractEmailVerified(data: Record<string, unknown>): boolean {
		const addresses = data.email_addresses as
			| Array<{ id: string; verification?: { status: string } }>
			| undefined;

		const primaryId = data.primary_email_address_id as string | undefined;

		if (!addresses?.length) return false;

		const primary = primaryId
			? addresses.find((a) => a.id === primaryId)
			: addresses[0];

		return primary?.verification?.status === 'verified';
	}

	private extractPrimaryPhone(data: Record<string, unknown>): string | null {
		const phones = data.phone_numbers as
			| Array<{ id: string; phone_number: string }>
			| undefined;

		const primaryId = data.primary_phone_number_id as string | undefined;

		if (!phones?.length) return null;

		const primary = primaryId
			? phones.find((p) => p.id === primaryId)
			: phones[0];

		return primary?.phone_number ?? null;
	}

	private extractPhoneVerified(data: Record<string, unknown>): boolean {
		const phones = data.phone_numbers as
			| Array<{ id: string; verification?: { status: string } }>
			| undefined;

		const primaryId = data.primary_phone_number_id as string | undefined;

		if (!phones?.length) return false;

		const primary = primaryId
			? phones.find((p) => p.id === primaryId)
			: phones[0];

		return primary?.verification?.status === 'verified';
	}

	/**
	 * Extracts the OAuth provider from the primary external account.
	 * Strips the 'oauth_' prefix so callers get 'google' | 'github' | null.
	 * Returns null for password/magic-link users with no external account.
	 */
	private extractOauthProvider(data: Record<string, unknown>): string | null {
		const accounts = data.external_accounts as
			| Array<{ provider: string }>
			| undefined;

		if (!accounts?.length) return null;

		const raw = accounts[0].provider; // e.g. 'oauth_google'

		return raw?.replace(/^oauth_/, '') ?? null;
	}
}
