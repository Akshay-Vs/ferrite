import FadeInItem from '@/presentation/animations/fade-in-item';
import { Card } from '@/presentation/primitives/card';

const SalesOverview = () => {
	return (
		<div className="h-[max(44.48rem,calc(100dvh-22.97rem))] grid grid-rows-[3fr_2fr] gap-4">
			<div className="grid grid-cols-[3fr_1fr] gap-4">
				<FadeInItem>
					<Card className="h-full center bg-surface/40 border-gradient">
						Main Chart
					</Card>
				</FadeInItem>

				<FadeInItem>
					<Card className="h-full center bg-surface/40 border-gradient">
						Low on Stock
					</Card>
				</FadeInItem>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<FadeInItem>
					<Card className="h-full center bg-surface/40 border-gradient">
						second chart
					</Card>
				</FadeInItem>

				<FadeInItem>
					<Card className="h-full center bg-surface/40 border-gradient">
						third chart
					</Card>
				</FadeInItem>
			</div>
		</div>
	);
};

export default SalesOverview;
