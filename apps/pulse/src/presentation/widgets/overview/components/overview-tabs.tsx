'use client';

import { usePathname } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import {
	REVENUE_OVERVIEW,
	SALES_OVERVIEW,
	TRAFFIC_OVERVIEW,
} from '@/core/constants/routes.constants';
import { cn } from '@/core/utils/utils';
import FadeInItem from '@/presentation/animations/fade-in-item';
import { Button } from '@/presentation/primitives/button';

const tabs: Array<{ label: string; href: string }> = [
	{
		label: 'Sales',
		href: SALES_OVERVIEW,
	},
	{
		label: 'Revenue',
		href: REVENUE_OVERVIEW,
	},
	{
		label: 'Traffic',
		href: TRAFFIC_OVERVIEW,
	},
];

const OverviewTabs = () => {
	const router = useRouter();
	const pathname = usePathname();

	return (
		<FadeInItem className="flex gap-5">
			{tabs.map((tab) => {
				const isActive = pathname === tab.href;

				return (
					<Button
						variant={isActive ? 'secondary' : 'ghost'}
						key={tab.label}
						size="lg"
						onClick={() => router.push(tab.href)}
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
