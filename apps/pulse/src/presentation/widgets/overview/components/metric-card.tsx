import { TrendingUp } from 'lucide-react';
import { formatCompactNumber } from '@/core/utils/format-compact-number';

interface MetricCardProps {
	label: string;
	valuePrefix?: string;
	currentValue: number;
	deltaPercent?: number;
	trend?: 'up' | 'down';
}

const MetricCard = ({
	label,
	currentValue,
	valuePrefix,
	deltaPercent,
	trend,
}: MetricCardProps) => {
	return (
		<div className="flex gap-2">
			{deltaPercent === undefined && (
				<div className="flex gap-2 -translate-y-4 translate-x-4">
					<p>{deltaPercent}%</p>
					{trend === 'up' ? (
						<TrendingUp className="w-4 h-4 text-green-400" />
					) : (
						<TrendingUp className="w-4 h-4 text-red-400" />
					)}
				</div>
			)}
			<div className="col-center gap-2">
				<h2 className="text-5xl font-light w-full text-end">
					{valuePrefix}
					{formatCompactNumber(currentValue)}
				</h2>
				<p className="text-base font-light">{label}</p>
			</div>
		</div>
	);
};

export default MetricCard;
