'use client';

import { cn } from '@/core/utils/utils';
import FadeInItem from '@/presentation/animations/fade-in-item';
import { Button } from '@/presentation/primitives/button';
import { useOverviewStore } from '../stores/overview-store';
import type { Tab } from '../types/overview-tabs';

const tabs: Array<{ label: Tab }> = [
	{
		label: 'Sales',
	},
	{
		label: 'Revenue',
	},
	{
		label: 'Traffic',
	},
];
const OverviewTabs = () => {
	const { selectedTab, setSelectedTab } = useOverviewStore();

	return (
		<FadeInItem className="flex gap-5">
			{tabs.map((tab) => {
				const isActive = selectedTab === tab.label;
				return (
					<Button
						variant={isActive ? 'secondary' : 'ghost'}
						key={tab.label}
						size="lg"
						onClick={() => setSelectedTab(tab.label)}
						className={cn(
							'px-12 w-40 h-14 duration-200 ease-in-out',
							!isActive
								? 'bg-surface border border-active text-content aria-expanded:bg-secondary aria-expanded:text-secondary-foreground'
								: 'hover:hover:bg-primary'
						)}
					>
						{tab.label}
					</Button>
				);
			})}
		</FadeInItem>
	);
};

export default OverviewTabs;
