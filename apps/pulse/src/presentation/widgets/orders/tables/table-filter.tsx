'use client';

import { Columns, Expand, FilterIcon, Shrink } from 'lucide-react';
import { Button } from '@/presentation/primitives/button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/presentation/primitives/dropdown-menu';
import {
	updateOrdersTableExpanded,
	updateOrdersTableFilters,
	updateOrdersTableVisibility,
	useOrdersTableStore,
} from '../stores/orders-table.store';

const statuses = [
	'delivered',
	'inTransit',
	'processing',
	'returned',
	'cancelled',
];

const columnsConfig = [
	{ id: 'id', label: 'Order ID' },
	{ id: 'products', label: 'Products' },
	{ id: 'date', label: 'Date' },
	{ id: 'user', label: 'User' },
	{ id: 'address', label: 'Address' },
	{ id: 'amount', label: 'Amount' },
	{ id: 'transactionStatus', label: 'Transaction Status' },
	{ id: 'transactionMethod', label: 'Transaction Method' },
	{ id: 'status', label: 'Status' },
];

const TableFilter = () => {
	const expandedState = useOrdersTableStore((state) => state.expandedState);
	const columnFilters = useOrdersTableStore((state) => state.columnFilters);
	const columnVisibility = useOrdersTableStore(
		(state) => state.columnVisibility
	);

	const isExpanded = expandedState === true;

	const statusFilter = columnFilters.find((f) => f.id === 'status');
	const statusFilters = (statusFilter?.value as string[]) || [];

	const toggleExpandAll = () => {
		updateOrdersTableExpanded(isExpanded ? {} : true);
	};

	const handleStatusChange = (status: string, checked: boolean) => {
		const nextFilters = checked
			? [...statusFilters, status]
			: statusFilters.filter((s) => s !== status);

		const newColumnFilters =
			nextFilters.length > 0
				? [
						...columnFilters.filter((f) => f.id !== 'status'),
						{ id: 'status', value: nextFilters },
					]
				: columnFilters.filter((f) => f.id !== 'status');

		updateOrdersTableFilters(newColumnFilters);
	};

	const handleColumnToggle = (columnId: string, isVisible: boolean) => {
		updateOrdersTableVisibility({
			...columnVisibility,
			[columnId]: isVisible,
		});
	};

	return (
		<div className="flex items-center gap-2">
			<Button
				size="icon"
				variant="tertiary"
				tooltip={isExpanded ? 'Collapse All' : 'Expand All'}
				tooltipPosition="bottom"
				aria-label={isExpanded ? 'Collapse All' : 'Expand All'}
				onClick={toggleExpandAll}
			>
				{isExpanded ? (
					<Shrink className="text-foreground" />
				) : (
					<Expand className="text-foreground" />
				)}
			</Button>

			<DropdownMenu>
				<Button
					size="icon"
					tooltip="Filter"
					variant="tertiary"
					tooltipPosition="bottom"
					aria-label="Filter"
					aria-haspopup="true"
					render={
						<DropdownMenuTrigger>
							<FilterIcon className="text-foreground" />
						</DropdownMenuTrigger>
					}
				/>
				<DropdownMenuContent align="end" className="w-48">
					<DropdownMenuGroup>
						<DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{statuses.map((status) => (
							<DropdownMenuCheckboxItem
								key={status}
								checked={statusFilters.includes(status)}
								onCheckedChange={(checked) =>
									handleStatusChange(status, !!checked)
								}
								className="capitalize"
							>
								{status}
							</DropdownMenuCheckboxItem>
						))}
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>

			<DropdownMenu>
				<Button
					size="icon"
					variant="tertiary"
					tooltip="View Columns"
					tooltipPosition="bottom"
					aria-label="View Columns"
					aria-haspopup="true"
					render={
						<DropdownMenuTrigger>
							<Columns className="text-foreground" />
						</DropdownMenuTrigger>
					}
				/>
				<DropdownMenuContent align="end" className="w-56">
					<DropdownMenuGroup>
						<DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{columnsConfig.map((col) => {
							const isVisible = columnVisibility[col.id] !== false;
							return (
								<DropdownMenuCheckboxItem
									key={col.id}
									checked={isVisible}
									onCheckedChange={(checked) =>
										handleColumnToggle(col.id, !!checked)
									}
								>
									{col.label}
								</DropdownMenuCheckboxItem>
							);
						})}
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

export default TableFilter;
