import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoreSelectionState {
	selectedStoreId: string | undefined;
}

export const useStoreSelection = create<StoreSelectionState>()(
	persist(
		(): StoreSelectionState => ({
			selectedStoreId: undefined,
		}),
		{
			name: 'active-store-storage',
		}
	)
);

export const setSelectedStore = (id: string) => {
	useStoreSelection.setState({ selectedStoreId: id });
};
