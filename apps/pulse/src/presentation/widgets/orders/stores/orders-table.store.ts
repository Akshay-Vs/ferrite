import type {
	ColumnFiltersState,
	ExpandedState,
	VisibilityState,
} from '@tanstack/react-table';
import { create } from 'zustand';

interface OrdersTableState {
	expandedState: ExpandedState;
	columnFilters: ColumnFiltersState;
	columnVisibility: VisibilityState;
}

export const useOrdersTableStore = create<OrdersTableState>()(() => ({
	expandedState: {},
	columnFilters: [],
	columnVisibility: {},
}));

export const updateOrdersTableFilters = (
	filtersOrUpdater:
		| ColumnFiltersState
		| ((old: ColumnFiltersState) => ColumnFiltersState)
) => {
	useOrdersTableStore.setState((state) => ({
		columnFilters:
			typeof filtersOrUpdater === 'function'
				? filtersOrUpdater(state.columnFilters)
				: filtersOrUpdater,
	}));
};

export const updateOrdersTableExpanded = (
	expandedOrUpdater: ExpandedState | ((old: ExpandedState) => ExpandedState)
) => {
	useOrdersTableStore.setState((state) => ({
		expandedState:
			typeof expandedOrUpdater === 'function'
				? expandedOrUpdater(state.expandedState)
				: expandedOrUpdater,
	}));
};

export const updateOrdersTableVisibility = (
	visibilityOrUpdater:
		| VisibilityState
		| ((old: VisibilityState) => VisibilityState)
) => {
	useOrdersTableStore.setState((state) => ({
		columnVisibility:
			typeof visibilityOrUpdater === 'function'
				? visibilityOrUpdater(state.columnVisibility)
				: visibilityOrUpdater,
	}));
};

export const clearOrdersTableStore = () => {
	useOrdersTableStore.setState({
		expandedState: {},
		columnFilters: [],
		columnVisibility: {},
	});
};
