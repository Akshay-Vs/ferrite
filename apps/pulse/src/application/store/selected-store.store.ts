import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoreSelectionState {
	selectedStoreId: string | undefined;
	setSelectedStore: (id: string) => void;
}

export const useStoreSelection = create<StoreSelectionState>()(
	persist(
		(set) => ({
			selectedStoreId: undefined,
			setSelectedStore: (id: string) => set({ selectedStoreId: id }),
		}),
		{
			name: 'active-store-storage',
		}
	)
);
