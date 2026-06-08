import type { OrdersRowProps } from '../../types/orders-row';

export const DateCell = ({ row }: OrdersRowProps) => {
	const date = new Date(row.getValue('date') as string);

	return (
		<div className="w-full h-fit center">
			<div className="w-28">{date.toLocaleDateString()}</div>
		</div>
	);
};
