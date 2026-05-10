import { OnboardingService } from '@ferrite/api';
import type {
	OnboardingAboutUser,
	OnboardingSession,
	OnboardingStoreCreate,
} from '@ferrite/schema';
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
 * Hook to access the raw OnboardingService API methods.
 */
function useOnboardingService() {
	const client = useFerriteClient();
	return useMemo(() => new OnboardingService(client), [client]);
}

/**
 * Fetches the current onboarding session state.
 */
export function useGetOnboardingSession(
	options?: Omit<UseQueryOptions<OnboardingSession>, 'queryKey' | 'queryFn'>
) {
	const service = useOnboardingService();

	return useQuery({
		queryKey: queryKeys.onboarding.session.queryKey,
		queryFn: () => service.getSession(),
		...options,
	});
}

/**
 * Mutation to update user data for the onboarding process.
 */
export function useOnboardUser(
	options?: UseMutationOptions<OnboardingSession, Error, OnboardingAboutUser>
) {
	const service = useOnboardingService();

	return useMutation({
		mutationFn: (payload) => service.onboardUser(payload),
		...options,
	});
}

/**
 * Mutation to create the first store for the user during onboarding.
 */
export function useOnboardStore(
	options?: UseMutationOptions<OnboardingSession, Error, OnboardingStoreCreate>
) {
	const service = useOnboardingService();

	return useMutation({
		mutationFn: (payload) => service.onboardStore(payload),
		...options,
	});
}
