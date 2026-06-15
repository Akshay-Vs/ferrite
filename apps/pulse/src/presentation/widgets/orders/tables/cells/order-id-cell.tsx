import CellActionButton from '../../components/cell-action-button';
import { openOrderSheet } from '../../stores/order-sheet-store';
import type { OrdersRowProps } from '../../types/orders-row';

export const OrderIdCell = ({ row }: OrdersRowProps) => {
	return (
		<div className="w-full h-fit center">
			<CellActionButton
				className="w-24"
				value={row.getValue('id')}
				action={() =>
					openOrderSheet({
						activeSheet: 'order-details',
						orderId: row.getValue('id'),
					})
				}
			/>
		</div>
	);
};
