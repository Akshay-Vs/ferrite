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

const UserProfileSheet = () => {
	const sheet = useOrderSheetStore();

	const isOpen = sheet?.activeSheet === 'user-profile';

	const idRef = useRef<string | null>(null);
	if (sheet?.activeSheet === 'user-profile') {
		idRef.current = sheet.userId;
	}

	return (
		<Sheet open={isOpen} onOpenChange={(open) => !open && closeOrderSheet()}>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>User Profile</SheetTitle>
					<SheetDescription>{idRef.current}</SheetDescription>
				</SheetHeader>
			</SheetContent>
		</Sheet>
	);
};

export default UserProfileSheet;
