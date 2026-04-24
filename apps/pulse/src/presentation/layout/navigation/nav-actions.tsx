'use client';

import { BellIcon, SearchIcon } from 'lucide-react';
import { Button } from '@/presentation/primitives/button';

export const NavAction = () => {
	return (
		<div className="flex items-center gap-6">
			<Button size="icon">
				<SearchIcon className="w-6! h-6!" />
			</Button>

			<Button size="icon">
				<BellIcon className="w-6! h-6!" />
			</Button>
		</div>
	);
};
