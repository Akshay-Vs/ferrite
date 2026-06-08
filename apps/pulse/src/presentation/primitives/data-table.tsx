'use client';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@presentation/primitives/table';
import {
	type ColumnDef,
	type ColumnFiltersState,
	type ExpandedState,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	getFilteredRowModel,
	type OnChangeFn,
	useReactTable,
	type VisibilityState,
} from '@tanstack/react-table';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/core/utils/cn';
import { Button } from './button';

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	expanded?: ExpandedState;
	onExpandedChange?: OnChangeFn<ExpandedState>;
	columnFilters?: ColumnFiltersState;
	onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
	columnVisibility?: VisibilityState;
	onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	expanded,
	onExpandedChange,
	columnFilters,
	onColumnFiltersChange,
	columnVisibility,
	onColumnVisibilityChange,
}: DataTableProps<TData, TValue>) {
	const [localColumnFilters, setLocalColumnFilters] =
		useState<ColumnFiltersState>([]);
	const [localExpanded, setLocalExpanded] = useState<ExpandedState>({});
	const [localColumnVisibility, setLocalColumnVisibility] =
		useState<VisibilityState>({});

	const actualColumnFilters =
		columnFilters !== undefined ? columnFilters : localColumnFilters;
	const actualOnColumnFiltersChange =
		onColumnFiltersChange || setLocalColumnFilters;

	const actualExpanded = expanded !== undefined ? expanded : localExpanded;
	const actualOnExpandedChange = onExpandedChange || setLocalExpanded;

	const actualColumnVisibility =
		columnVisibility !== undefined ? columnVisibility : localColumnVisibility;
	const actualOnColumnVisibilityChange =
		onColumnVisibilityChange || setLocalColumnVisibility;

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getRowCanExpand: () => true,
		onColumnFiltersChange: actualOnColumnFiltersChange,
		onExpandedChange: actualOnExpandedChange,
		onColumnVisibilityChange: actualOnColumnVisibilityChange,
		state: {
			columnFilters: actualColumnFilters,
			expanded: actualExpanded,
			columnVisibility: actualColumnVisibility,
		},
	});

	return (
		<div className="overflow-hidden border border-border rounded-container bg-card">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								return (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext()
												)}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && 'selected'}
								onClick={() => row.toggleExpanded()}
								className={cn(
									'group cursor-pointer transition-all',
									row.getIsExpanded() && 'border-b border-border'
								)}
							>
								{row.getVisibleCells().map((cell, index) => (
									<TableCell
										key={cell.id}
										className={index === 0 ? 'relative' : ''}
									>
										{index === 0 && (
											<div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground">
												<ChevronRight
													className={cn(
														'h-4 w-4 transition-transform',
														row.getIsExpanded() && 'rotate-90'
													)}
												/>
											</div>
										)}
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>

			<div className="flex items-center justify-end space-x-2 py-4">
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					Next
				</Button>
			</div>
		</div>
	);
}
