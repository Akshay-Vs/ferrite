import type { LegendItem } from '../hooks/use-order-status-pill';
import { STAGGER_DELAY_MS } from '../lib/orders-status-chart.types';

const LegendLabel = ({ item }: { item: LegendItem }) => {
	const delayMs = item.staggerIndex * STAGGER_DELAY_MS;

	return (
		<div
			className="absolute flex flex-col items-center pointer-events-none animate-[legend-fade-in_300ms_ease-out_both]"
			style={{
				left: item.labelX,
				top: item.above ? item.dotY - 10 : item.dotY + 2,
				transform: 'translateX(-50%)',
				animationDelay: `${delayMs}ms`,
			}}
		>
			<span className="text-sm font-medium text-foreground whitespace-nowrap">
				{item.slice.def.label}
			</span>
		</div>
	);
};

export default LegendLabel;
