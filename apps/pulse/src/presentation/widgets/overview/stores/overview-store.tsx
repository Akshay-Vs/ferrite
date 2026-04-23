import { create } from 'zustand';
import type { Tab } from '../types/overview-tabs';

interface OverviewStore {
	selectedTab: Tab;
	setSelectedTab: (tab: Tab) => void;
}

export const useOverviewStore = create<OverviewStore>((set) => ({
	selectedTab: 'Sales',
	setSelectedTab: (tab) => set({ selectedTab: tab }),
}));
