import type { TransactionStatus } from '../../lib/orders-mock';
import { TRANSACTION_STATUS_COLOR } from '../../lib/orders-status-chart.types';
import type { OrdersRowProps } from '../../types/orders-row';

export const TransactionStatusCell = ({ row }: OrdersRowProps) => {
	const status = row.getValue('transactionStatus') as TransactionStatus;
	const color = TRANSACTION_STATUS_COLOR[status] || '#777777';

	return (
		<div className="w-full h-fit center max-w-32 capitalize">
			<span
				className="px-3 py-1 rounded-full border text-xs font-medium"
				style={{
					color: color,
					backgroundColor: `${color}25`,
					borderColor: `${color}aa`,
				}}
			>
				{status}
			</span>
		</div>
	);
};

export const TransactionMethodCell = ({ row }: OrdersRowProps) => (
	<div className="w-full h-fit center max-w-64 capitalize">
		{row.getValue('transactionMethod')}
	</div>
);
