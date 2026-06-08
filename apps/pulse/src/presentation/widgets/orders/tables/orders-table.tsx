'use client';

import { DataTable } from '@/presentation/primitives/data-table';
import { orders } from '../lib/orders-mock';
import {
	updateOrdersTableExpanded,
	updateOrdersTableFilters,
	updateOrdersTableVisibility,
	useOrdersTableStore,
} from '../stores/orders-table.store';
import { ordersColumns } from './table-columns';

const OrdersTable = () => {
	const expandedState = useOrdersTableStore((state) => state.expandedState);
	const columnFilters = useOrdersTableStore((state) => state.columnFilters);
	const columnVisibility = useOrdersTableStore(
		(state) => state.columnVisibility
	);

	return (
		<DataTable
			columns={ordersColumns}
			data={orders}
			expanded={expandedState}
			onExpandedChange={updateOrdersTableExpanded}
			columnFilters={columnFilters}
			onColumnFiltersChange={updateOrdersTableFilters}
			columnVisibility={columnVisibility}
			onColumnVisibilityChange={updateOrdersTableVisibility}
		/>
	);
};

export default OrdersTable;
