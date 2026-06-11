'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Order } from '../lib/orders-mock';
import { AddressCell } from './cells/address-cell';
import { AmountCell } from './cells/amount-cell';
import { DateCell } from './cells/date-cell';
import { OrderIdCell } from './cells/order-id-cell';
import ProductsCell from './cells/products-cell';
import { StatusCell } from './cells/status-cell';
import {
	TransactionMethodCell,
	TransactionStatusCell,
} from './cells/transaction-cell';
import { UserCell } from './cells/user-cell';

export const ordersColumns: ColumnDef<Order>[] = [
	{
		accessorKey: 'id',
		header: 'Order ID',
		cell: ({ row }) => <OrderIdCell row={row} />,
	},
	{
		accessorKey: 'products',
		header: 'Products',
		cell: ({ row }) => <ProductsCell row={row} />,
	},
	{
		accessorKey: 'date',
		header: 'Date',
		cell: ({ row }) => <DateCell row={row} />,
	},
	{
		accessorKey: 'user',
		header: 'User',
		cell: ({ row }) => <UserCell row={row} />,
	},
	{
		accessorKey: 'address',
		header: 'Address',
		cell: ({ row }) => <AddressCell row={row} />,
	},
	{
		accessorKey: 'amount',
		header: 'Amount',
		cell: ({ row }) => <AmountCell row={row} />,
	},
	{
		accessorKey: 'transactionStatus',
		header: 'Payment Status',
		cell: ({ row }) => <TransactionStatusCell row={row} />,
	},
	{
		accessorKey: 'transactionMethod',
		header: 'Payment Method',
		cell: ({ row }) => <TransactionMethodCell row={row} />,
	},
	{
		accessorKey: 'status',
		header: 'Status',
		filterFn: (row, id, value: string[]) => {
			if (!value || value.length === 0) return true;
			return value.includes(row.getValue(id));
		},
		cell: ({ row }) => <StatusCell row={row} />,
	},
];
