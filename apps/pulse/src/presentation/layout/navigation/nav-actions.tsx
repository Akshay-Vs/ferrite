'use client';

import { BellIcon, SearchIcon } from 'lucide-react';
import { Button } from '@/presentation/primitives/button';
import NewActionMenu from './new-action-menu';

export const NavAction = () => {
	return (
		<div className="flex items-center gap-6">
			<NewActionMenu />

			<Button
				aria-label="Search"
				aria-haspopup="true"
				aria-description="Opens a menu with options to search for products"
				size="icon"
			>
				<SearchIcon className="w-6! h-6!" />
			</Button>

			<Button
				size="icon"
				aria-label="Notifications"
				role="link"
				aria-description="redirect to notifications page"
			>
				<BellIcon className="w-6! h-6!" />
			</Button>
		</div>
	);
};
