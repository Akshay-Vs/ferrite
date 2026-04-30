import FadeInItem from '@/presentation/animations/fade-in-item';
import { Card } from '@/presentation/primitives/card';
import TopSellingProducts from './top-selling-list';

const SalesOverview = () => {
	return (
		<div className="h-[max(44.48rem,calc(100dvh-20.78rem))] grid grid-rows-[3fr_2fr] gap-4">
			{/* TOP ROW */}
			<div className="grid grid-cols-[1fr_auto] gap-4 min-h-0">
				<FadeInItem className="min-h-0 min-w-0">
					<Card className="h-full w-full center bg-surface/40 border-gradient overflow-hidden">
						Main Chart
					</Card>
				</FadeInItem>

				<FadeInItem className="min-h-0 min-w-0 w-110 max-w-120">
					<TopSellingProducts />
				</FadeInItem>
			</div>

			{/* BOTTOM ROW */}
			<div className="grid grid-cols-2 gap-4 min-h-0">
				<FadeInItem className="min-h-0 min-w-0">
					<Card className="h-full center bg-surface/40 border-gradient overflow-hidden">
						second chart
					</Card>
				</FadeInItem>

				<FadeInItem className="min-h-0 min-w-0">
					<Card className="h-full center bg-surface/40 border-gradient overflow-hidden">
						third chart
					</Card>
				</FadeInItem>
			</div>
		</div>
	);
};

export default SalesOverview;
