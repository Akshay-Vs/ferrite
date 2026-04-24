import type { PropsWithChildren } from 'react';
import FadeInItem from '@/presentation/animations/fade-in-item';
import Greetings from '@/presentation/widgets/overview/components/greetings';
import KPIOverview from '@/presentation/widgets/overview/components/kpi-overview';
import OverviewTabs from '@/presentation/widgets/overview/components/overview-tabs';
import StockWarning from '@/presentation/widgets/overview/components/stock-warning';

const layout = ({ children }: PropsWithChildren) => {
	return (
		<FadeInItem className="full col gap-8 mt-14">
			<div className="flex items-end justify-between px-2">
				<Greetings />
				<KPIOverview />
			</div>

			<div className="flex items-end justify-between">
				<OverviewTabs />
				<StockWarning />
			</div>

			{children}
		</FadeInItem>
	);
};

export default layout;
