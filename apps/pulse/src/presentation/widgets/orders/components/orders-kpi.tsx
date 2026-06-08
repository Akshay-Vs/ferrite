import FadeInItem from '@/presentation/animations/fade-in-item';
import MetricCard from '@/presentation/primitives/metric-card';

const OrdersKPI = () => {
	return (
		<FadeInItem className="flex items-center gap-12">
			<MetricCard
				label="Orders placed"
				currentValue={8511}
				deltaPercent={10}
				trend="up"
			/>

			{/* <MetricCard label="Orders Pending" currentValue={992} /> */}

			<MetricCard label="Orders Delivered" currentValue={6192} />

			<MetricCard label="Orders Returned" currentValue={192} />
		</FadeInItem>
	);
};

export default OrdersKPI;
