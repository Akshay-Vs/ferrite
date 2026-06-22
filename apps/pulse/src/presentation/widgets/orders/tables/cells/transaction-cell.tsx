import { TransactionStatusLabel } from '../../components/transaction-status';
import type { TransactionStatus } from '../../lib/orders-mock';
import type { OrdersRowProps } from '../../types/orders-row';

export const TransactionStatusCell = ({ row }: OrdersRowProps) => {
	const status = row.getValue('transactionStatus') as TransactionStatus;

	return (
		<div className="w-full h-fit center max-w-32 capitalize">
			<TransactionStatusLabel status={status} />
		</div>
	);
};

export const TransactionMethodCell = ({ row }: OrdersRowProps) => (
	<div className="w-full h-fit center max-w-64 capitalize">
		{row.getValue('transactionMethod')}
	</div>
);
