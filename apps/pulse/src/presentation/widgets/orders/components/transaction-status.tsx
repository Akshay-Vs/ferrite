import type { TransactionStatus } from '../lib/orders-mock';
import { TRANSACTION_STATUS_COLOR } from '../lib/orders-status-chart.types';

export const TransactionStatusLabel = ({
	status,
}: {
	status: TransactionStatus;
}) => {
	const color = TRANSACTION_STATUS_COLOR[status] || '#777777';
	return (
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
	);
};
