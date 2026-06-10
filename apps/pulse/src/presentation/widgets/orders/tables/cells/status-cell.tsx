import { ChevronDown } from 'lucide-react';
import { cn } from '@/core/utils/cn';
import type { OrderStatus } from '../../lib/orders-mock';
import { COLOR } from '../../lib/orders-status-chart.types';
import type { OrdersRowProps } from '../../types/orders-row';

export const StatusCell = ({ row }: OrdersRowProps) => {
	const status = row.getValue('status') as OrderStatus;
	const color = COLOR[status];

	const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();

		console.log('clicked');
	};

	return (
		<div className="full center select-none">
			<button
				type="button"
				aria-label="Orders status"
				aria-haspopup="true"
				className={cn(
					'w-30 text-center font-normal capitalize px-2 py-2 text-[0.82rem] text-background rounded-full border center gap-1 border-border',
					'hover:shadow-md hover:scale-98 transition-all duration-200',
					'active:scale-95 active:shadow-md',
					'focus:outline-none focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2'
				)}
				style={{
					backgroundColor: `${color}`,
					outlineColor: `${color}`,
				}}
				onClick={handleClick}
			>
				{status}
				<ChevronDown strokeWidth={1.2} size={20} />
			</button>
		</div>
	);
};
