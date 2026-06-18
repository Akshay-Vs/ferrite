import type { OrdersRowProps } from '../../types/orders-row';

export const AmountCell = ({ row }: OrdersRowProps) => {
	const amount = row.getValue<number>('amount');

	return (
		<div className="w-full h-fit center max-w-64">$ {amount.toFixed(2)}</div>
	);
};
