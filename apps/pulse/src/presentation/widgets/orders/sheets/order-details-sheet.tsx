'use client';

import { useRef } from 'react';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@/presentation/primitives/sheet';
import {
	closeOrderSheet,
	useOrderSheetStore,
} from '../stores/order-sheet-store';

const OrderDetailsSheet = () => {
	const sheet = useOrderSheetStore();

	const isOpen = sheet?.activeSheet === 'order-details';

	const idRef = useRef<string | null>(null);
	if (sheet?.activeSheet === 'order-details') {
		idRef.current = sheet.orderId;
	}

	return (
		<Sheet open={isOpen} onOpenChange={(open) => !open && closeOrderSheet()}>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Order Details</SheetTitle>
					<SheetDescription>{idRef.current}</SheetDescription>
				</SheetHeader>
			</SheetContent>
		</Sheet>
	);
};
export default OrderDetailsSheet;
