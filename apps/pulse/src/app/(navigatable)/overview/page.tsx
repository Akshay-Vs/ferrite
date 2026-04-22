'use client';
import Greetings from '@/presentation/widgets/overview/greetings';
import KPISummery from '@/presentation/widgets/overview/kpi-summery';

const OverviewPage = () => {
	return (
		<div className="full col gap-8 mt-14">
			<div className="flex items-end justify-between px-2">
				<Greetings />
				<KPISummery />
			</div>
		</div>
	);
};

export default OverviewPage;
