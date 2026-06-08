import type { Row } from '@tanstack/react-table';
import type { Order } from '../lib/orders-mock';

export type OrdersRow = Row<Order>;
export type OrdersRowProps = {
	row: OrdersRow;
};
