import type { OnboardingStorePayload } from '@ferrite/schema';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoreCreationState {
	onboardingStore: Partial<OnboardingStorePayload>;
}

export const useOnboardingStore = create<StoreCreationState>()(
	persist(
		(): StoreCreationState => ({
			onboardingStore: {},
		}),
		{
			name: 'onboarding-store-storage',
		}
	)
);

export const updateOnboardingStore = (
	stepData: Partial<OnboardingStorePayload>
) => {
	useOnboardingStore.setState((state) => ({
		onboardingStore: { ...state.onboardingStore, ...stepData },
	}));
};

export const clearOnboardingStore = () => {
	useOnboardingStore.setState({ onboardingStore: {} });
};
