import type { OrdersRowProps } from '../../types/orders-row';

export const OrderIdCell = ({ row }: OrdersRowProps) => {
	return (
		<div className="w-full h-fit center">
			<div className="w-24  ">{row.getValue('id')}</div>
		</div>
	);
};
