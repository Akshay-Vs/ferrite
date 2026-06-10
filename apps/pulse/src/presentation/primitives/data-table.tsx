'use client';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@presentation/primitives/table';
import { flexRender, type Row } from '@tanstack/react-table';
import { ChevronRight } from 'lucide-react';
import {
	type UseDataTableProps,
	useDataTable,
} from '@/core/hooks/use-data-table';
import { cn } from '@/core/utils/cn';
import { Button } from './button';

export interface DataTableProps<TData, TValue>
	extends UseDataTableProps<TData, TValue> {
	getRowClassName?: (row: Row<TData>) => string | undefined;
}

export function DataTable<TData, TValue>({
	getRowClassName,
	expandable = true,
	...props
}: DataTableProps<TData, TValue>) {
	const { table, getRowProps } = useDataTable({ expandable, ...props });

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
						table.getRowModel().rows.map((row, index) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && 'selected'}
								onClick={expandable ? () => row.toggleExpanded() : undefined}
								{...getRowProps(row.id, index, () => row.toggleExpanded())}
								className={cn(
									'group transition-all',
									expandable && 'cursor-pointer',
									row.getIsExpanded() && 'border-b border-border',
									getRowClassName?.(row)
								)}
							>
								{row.getVisibleCells().map((cell, index) => (
									<TableCell
										key={cell.id}
										className={index === 0 ? 'relative' : ''}
									>
										{expandable && index === 0 && (
											<div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity text-muted-foreground">
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
							<TableCell
								colSpan={props.columns.length}
								className="h-24 text-center"
							>
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
