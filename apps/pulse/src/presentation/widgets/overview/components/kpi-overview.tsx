import FadeInItem from '@/presentation/animations/fade-in-item';
import MetricCard from './metric-card';

const KPIOverview = () => {
	return (
		<FadeInItem className="flex items-center gap-12">
			<MetricCard
				label="Products Sold"
				currentValue={21511}
				deltaPercent={10}
				trend="up"
			/>

			<MetricCard
				label="Revenue generated"
				valuePrefix="$"
				currentValue={62192}
				deltaPercent={17}
				trend="down"
			/>

			<MetricCard label="Campaigns" currentValue={16} />
		</FadeInItem>
	);
};

export default KPIOverview;
