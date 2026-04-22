import MetricCard from './metric-card';

const KPISummery = () => {
	return (
		<div className="flex items-center gap-12">
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
				trend="up"
			/>

			<MetricCard label="Campaigns" currentValue={16} />
		</div>
	);
};

export default KPISummery;
