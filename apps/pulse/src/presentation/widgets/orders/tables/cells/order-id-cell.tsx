import { sheetRouter } from '@/presentation/sheet-router/sheet-router.store';
import CellActionButton from '../../components/cell-action-button';
import type { OrdersRowProps } from '../../types/orders-row';

export const OrderIdCell = ({ row }: OrdersRowProps) => {
	return (
		<div className="w-full h-fit center">
			<CellActionButton
				className="w-24 py-2"
				value={row.getValue('id')}
				action={() =>
					sheetRouter.push('order-details', {
						orderId: row.getValue('id'),
					})
				}
			/>
		</div>
	);
};
