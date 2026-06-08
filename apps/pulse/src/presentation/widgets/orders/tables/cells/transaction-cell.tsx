import type { OrdersRowProps } from '../../types/orders-row';

export const TransactionStatusCell = ({ row }: OrdersRowProps) => (
	<div className="wfull h-fit center max-w-64 capitalize">
		{row.getValue('transactionStatus')}
	</div>
);

export const TransactionMethodCell = ({ row }: OrdersRowProps) => (
	<div className="w-full h-fit center max-w-64 capitalize">
		{row.getValue('transactionMethod')}
	</div>
);
