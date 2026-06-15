import { create } from 'zustand';

type OrderSheetState =
	| { activeSheet: 'order-details'; orderId: string }
	| { activeSheet: 'user-profile'; userId: string }
	| { activeSheet: 'product-details'; productId: string }
	| { activeSheet: 'transaction-details'; transactionId: string }
	| null;

export type Sheet = NonNullable<OrderSheetState>['activeSheet'];

export const useOrderSheetStore = create<OrderSheetState>()(() => null);

export const openOrderSheet = (state: NonNullable<OrderSheetState>) => {
	useOrderSheetStore.setState(state, true);
	console.log(state);
};

export const closeOrderSheet = () => {
	useOrderSheetStore.setState(null, true);
};

export const isSheetActive = (sheet: Sheet): boolean => {
	const state = useOrderSheetStore.getState()?.activeSheet === sheet;
	console.log(sheet, state);
	return state;
};
