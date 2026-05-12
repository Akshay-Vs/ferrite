import type { OnboardingStoreCreate } from '@ferrite/schema';
import type { OnboardingState } from '@ferrite/schema/onboarding/onboarding-session.zodschema';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoreCreationState {
	onboardingStore: Partial<OnboardingStoreCreate>;
	step: OnboardingState;
}

export const useOnboardingStore = create<StoreCreationState>()(
	persist(
		(): StoreCreationState => ({
			onboardingStore: {},
			step: 'ABOUT_ME',
		}),
		{
			name: 'onboarding-store-storage',
		}
	)
);

// Your existing external actions pattern
export const setOnboardingStep = (step: OnboardingState) => {
	useOnboardingStore.setState({ step });
};

export const updateOnboardingStore = (
	stepData: Partial<OnboardingStoreCreate>
) => {
	useOnboardingStore.setState((state) => ({
		onboardingStore: { ...state.onboardingStore, ...stepData },
	}));
};

export const clearOnboardingStore = () => {
	useOnboardingStore.setState({ onboardingStore: {} });
};
