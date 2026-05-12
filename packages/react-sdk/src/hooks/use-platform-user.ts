import { PlatformUsersService } from '@ferrite/api';
import type { ListAllUsers } from '@ferrite/schema';
import type { UpdateProfileInput } from '@ferrite/schema/users/update-profile.zodschema';
import type { UpdateRoleInput } from '@ferrite/schema/users/update-role.zodschema';
import type { UserProfileFull } from '@ferrite/schema/users/user-profile.zodschema';
import {
	type UseMutationOptions,
	type UseQueryOptions,
	useMutation,
	useQuery,
} from '@tanstack/react-query';
import { useMemo } from 'react';
import { queryKeys } from '../constants/query-keys';
import { useFerriteClient } from '../providers/ferrite-provider';

/**
 * Hook to access the raw PlatformUsersService API methods.
 */
function usePlatformUserService() {
	const client = useFerriteClient();
	return useMemo(() => new PlatformUsersService(client), [client]);
}

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

/**
 * Fetches the authenticated user's full profile.
 */
export function useGetMyProfile(
	options?: Omit<UseQueryOptions<UserProfileFull>, 'queryKey' | 'queryFn'>
) {
	const service = usePlatformUserService();

	return useQuery({
		queryKey: queryKeys.users.me.queryKey,
		queryFn: () => service.getProfile(),
		...options,
	});
}

/**
 * Fetches all platform users.
 * Requires `staff` or above role.
 */
export function useGetAllUsers(
	cursor?: string,
	limit?: string,
	options?: Omit<UseQueryOptions<ListAllUsers>, 'queryKey' | 'queryFn'>
) {
	const service = usePlatformUserService();

	return useQuery({
		queryKey: queryKeys.users.all(cursor, limit).queryKey,
		queryFn: () => service.getAllUsers(cursor, limit),
		...options,
	});
}

/**
 * Fetches a single user by ID.
 * Requires `staff` or above role.
 */
export function useGetUserById(
	userId: string,
	options?: Omit<UseQueryOptions<UserProfileFull>, 'queryKey' | 'queryFn'>
) {
	const service = usePlatformUserService();

	return useQuery({
		queryKey: queryKeys.users.detail(userId).queryKey,
		queryFn: () => service.getUserById(userId),
		enabled: !!userId && (options?.enabled ?? true),
		...options,
	});
}

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

/**
 * Mutation to update the authenticated user's profile.
 */
export function useUpdateProfile(
	options?: UseMutationOptions<UserProfileFull, Error, UpdateProfileInput>
) {
	const service = usePlatformUserService();

	return useMutation({
		mutationFn: (payload) => service.updateProfile(payload),
		...options,
	});
}

/**
 * Mutation to delete the authenticated user's profile.
 */
export function useDeleteProfile(
	options?: UseMutationOptions<boolean, Error, void>
) {
	const service = usePlatformUserService();

	return useMutation({
		mutationFn: () => service.deleteProfile(),
		...options,
	});
}

/**
 * Mutation to update a user's role.
 * Requires `staff` or above role.
 */
export function useUpdateUserRole(
	options?: UseMutationOptions<
		UpdateRoleInput,
		Error,
		{ userId: string; payload: UpdateRoleInput }
	>
) {
	const service = usePlatformUserService();

	return useMutation({
		mutationFn: ({ userId, payload }) => service.updateRole(userId, payload),
		...options,
	});
}
