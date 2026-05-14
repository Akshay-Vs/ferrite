import { useGetAllStores } from '@ferrite/react';
import { useEffect, useState } from 'react';
import {
	setSelectedStore,
	useStoreSelection,
} from '@/application/store/selected-store.store';
import { toast } from '@/presentation/primitives/sonner';

export const useStoreSelector = () => {
	const { selectedStoreId } = useStoreSelection();

	const [isMounted, setIsMounted] = useState(false);
	const { data: stores = [], isLoading, isSuccess } = useGetAllStores();

	useEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		if (!isSuccess || !stores.length) return;

		const currentSelection = useStoreSelection.getState().selectedStoreId;
		const currentSelectionName = useStoreSelection.getState().selectedStoreName;

		const isSelectionValid = stores.some(
			(store) => store.id === currentSelection
		);

		// Execute assignment and notify if the cached store is obsolete or null
		if (!currentSelection || !isSelectionValid) {
			const fallbackStore = stores[0];
			setSelectedStore(fallbackStore.id, fallbackStore.name);

			// Deploy an informational toast denoting system-initiated state mutation
			toast.info(`Switched store to ${fallbackStore.name}`, {
				description: `Unable to find ${currentSelectionName ?? 'selected store'}. Falling back to ${fallbackStore.name}.`,
			});
		}
	}, [isSuccess, stores]);

	const handleChange = (id: string | null) => {
		if (!id) return;

		const name = stores.find((store) => store.id === id)?.name;

		console.log(name);

		setSelectedStore(id, name);
	};

	const isReady = !isLoading;
	const selectedStore = stores.find((s) => s.id === selectedStoreId);

	const activeValue =
		isReady && selectedStore ? String(selectedStore.id) : undefined;

	return {
		isReady,
		isMounted,
		selectedStore,
		activeValue,
		handleChange,
		stores,
	};
};
