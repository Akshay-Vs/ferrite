import { StoreService } from '@ferrite/api';
import type { CreateStoreInput } from '@ferrite/schema/stores/create-store.zodschema';
import type {
	GetAllStores,
	GetStore,
} from '@ferrite/schema/stores/get-store.zodschema';
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
 * Hook to access the raw StoreService API methods.
 */
function useStoreService() {
	const client = useFerriteClient();
	return useMemo(() => new StoreService(client), [client]);
}

/**
 * Fetches all stores the user is a member of.
 */
export function useGetAllStores(
	options?: Omit<UseQueryOptions<GetAllStores[]>, 'queryKey' | 'queryFn'>
) {
	const service = useStoreService();

	return useQuery({
		queryKey: queryKeys.stores.all.queryKey,
		queryFn: () => service.getAllStores(),
		...options,
	});
}

/**
 * Fetches the details of a single store.
 */
export function useGetStore(
	storeId: string,
	options?: Omit<UseQueryOptions<GetStore>, 'queryKey' | 'queryFn'>
) {
	const service = useStoreService();

	return useQuery({
		queryKey: queryKeys.stores.detail(storeId).queryKey,
		queryFn: () => service.getStore(storeId),
		enabled: !!storeId && (options?.enabled ?? true),
		...options,
	});
}

/**
 * Mutation to create a new store (authenticated POST /stores).
 */
export function useCreateStore(
	options?: UseMutationOptions<GetStore, Error, CreateStoreInput>
) {
	const service = useStoreService();

	return useMutation({
		mutationFn: (payload) => service.createStore(payload),
		...options,
	});
}
