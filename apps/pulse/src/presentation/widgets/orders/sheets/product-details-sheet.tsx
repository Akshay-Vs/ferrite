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

const ProductDetailsSheet = () => {
	const sheet = useOrderSheetStore();
	const isOpen = sheet?.activeSheet === 'product-details';

	const idRef = useRef<string | null>(null);
	if (sheet?.activeSheet === 'product-details') {
		idRef.current = sheet.productId;
	}

	return (
		<Sheet open={isOpen} onOpenChange={(open) => !open && closeOrderSheet()}>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Product Details</SheetTitle>
					<SheetDescription>{idRef.current}</SheetDescription>
				</SheetHeader>
			</SheetContent>
		</Sheet>
	);
};
export default ProductDetailsSheet;
