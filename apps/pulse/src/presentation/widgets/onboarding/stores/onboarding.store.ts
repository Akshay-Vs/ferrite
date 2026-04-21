import { create } from 'zustand';
import type { OnboardingStoreCreate } from '../schemas/onboarding-store.zodschema';

interface StoreCreationState {
	data: Partial<OnboardingStoreCreate>;
	updateData: (stepData: Partial<OnboardingStoreCreate>) => void;
	clearSession: () => void;
}

export const useStoreCreationStore = create<StoreCreationState>((set) => ({
	data: {},
	updateData: (stepData) =>
		set((state) => ({ data: { ...state.data, ...stepData } })),
	clearSession: () => set({ data: {} }),
}));
