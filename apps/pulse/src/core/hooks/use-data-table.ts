import {
	type ColumnDef,
	type ColumnFiltersState,
	type ExpandedState,
	getCoreRowModel,
	getExpandedRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	type OnChangeFn,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from '@tanstack/react-table';
import { useCallback, useState } from 'react';

export interface UseDataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	expandable?: boolean;
	expanded?: ExpandedState;
	onExpandedChange?: OnChangeFn<ExpandedState>;
	columnFilters?: ColumnFiltersState;
	onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
	columnVisibility?: VisibilityState;
	onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
}

export function useDataTable<TData, TValue>({
	columns,
	data,
	expandable = true,
	expanded,
	onExpandedChange,
	columnFilters,
	onColumnFiltersChange,
	columnVisibility,
	onColumnVisibilityChange,
}: UseDataTableProps<TData, TValue>) {
	const [localColumnFilters, setLocalColumnFilters] =
		useState<ColumnFiltersState>([]);
	const [localExpanded, setLocalExpanded] = useState<ExpandedState>({});
	const [localColumnVisibility, setLocalColumnVisibility] =
		useState<VisibilityState>({});
	const [sorting, setSorting] = useState<SortingState>([]);

	const [focusedRowId, setFocusedRowId] = useState<string | null>(null);

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
		getRowCanExpand: () => expandable,
		onColumnFiltersChange: actualOnColumnFiltersChange,
		onExpandedChange: actualOnExpandedChange,
		onColumnVisibilityChange: actualOnColumnVisibilityChange,
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),

		state: {
			columnFilters: actualColumnFilters,
			expanded: actualExpanded,
			columnVisibility: actualColumnVisibility,
			sorting,
		},
	});

	const getRowProps = useCallback(
		(rowId: string, index: number, toggleExpanded: () => void) => {
			return {
				tabIndex:
					focusedRowId === rowId || (focusedRowId === null && index === 0)
						? 0
						: -1,
				onFocus: () => setFocusedRowId(rowId),
				onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
					if (e.key === 'Enter') {
						toggleExpanded();
					} else if (e.key === 'ArrowDown') {
						e.preventDefault();
						const nextRow = e.currentTarget.nextElementSibling as HTMLElement;
						if (nextRow) nextRow.focus();
					} else if (e.key === 'ArrowUp') {
						e.preventDefault();
						const prevRow = e.currentTarget
							.previousElementSibling as HTMLElement;
						if (prevRow) prevRow.focus();
					}
				},
			};
		},
		[focusedRowId]
	);

	return {
		table,
		getRowProps,
	};
}
