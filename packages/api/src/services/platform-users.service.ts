import { type ListAllUsers, listAllUsersSchema } from '@ferrite/schema';
import type { UpdateProfileInput } from '@ferrite/schema/users/update-profile.zodschema';
import {
	type UpdateRoleInput,
	updateRoleSchema,
} from '@ferrite/schema/users/update-role.zodschema';
import {
	type UserProfileFull,
	userProfileFullSchema,
} from '@ferrite/schema/users/user-profile.zodschema';
import z from 'zod';
import type { FerriteClient } from '../client';

export class PlatformUsersService {
	private readonly domain = 'users';

	constructor(private readonly client: FerriteClient) {}

	/**
	 * Get the profile of the current user.
	 */
	public async getProfile(): Promise<UserProfileFull> {
		return this.client.get(`${this.domain}/me`, userProfileFullSchema);
	}

	/**
	 * Update the profile of the current user.
	 *
	 * @param UpdateProfileInput The updated profile.
	 */
	public async updateProfile(
		payload: UpdateProfileInput
	): Promise<UserProfileFull> {
		return this.client.patch(
			`${this.domain}/me`,
			userProfileFullSchema,
			payload
		);
	}

	/**
	 * Delete the profile of the current user.
	 */
	public async deleteProfile(): Promise<boolean> {
		return this.client.delete(`${this.domain}/me`, z.boolean());
	}

	/// Privileged Admin Routes

	/**
	 * Update the role of a user.
	 * Requires the `staff` or above role.
	 *
	 * @param userId The ID of the user to update.
	 * @param payload The updated role.
	 */
	public async updateRole(userId: string, payload: UpdateRoleInput) {
		return this.client.patch(
			`${this.domain}/${userId}/role`,
			updateRoleSchema,
			payload
		);
	}

	/**
	 * Get all users.
	 * Requires the `staff` or above role.
	 *
	 * @param cursor The cursor to start from.
	 * @param limit The number of users to return.
	 */
	public async getAllUsers(
		cursor?: string,
		limit?: string
	): Promise<ListAllUsers> {
		return this.client.get(this.domain, listAllUsersSchema, {
			params: {
				cursor,
				limit,
			},
		});
	}

	/**
	 * Get a user by ID.
	 * Requires the `staff` or above role.
	 *
	 * @param id The ID of the user to get.
	 */
	public async getUserById(id: string) {
		return this.client.get(`${this.domain}/${id}`, userProfileFullSchema);
	}
}
