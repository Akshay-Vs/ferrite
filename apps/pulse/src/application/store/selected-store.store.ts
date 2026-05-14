import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoreSelectionState {
	selectedStoreId: string | undefined;
	selectedStoreName: string | undefined;
}

export const useStoreSelection = create<StoreSelectionState>()(
	persist(
		(): StoreSelectionState => ({
			selectedStoreId: undefined,
			selectedStoreName: undefined,
		}),
		{
			name: 'active-store-storage',
		}
	)
);

export const setSelectedStore = (id: string, name: string | undefined) => {
	useStoreSelection.setState({ selectedStoreId: id, selectedStoreName: name });
};
