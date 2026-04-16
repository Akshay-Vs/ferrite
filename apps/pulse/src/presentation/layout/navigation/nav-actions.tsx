'use client';

import { BellIcon, SearchIcon } from 'lucide-react';
import { Button } from '@/presentation/primitives/button';

export const NavAction = () => {
	return (
		<div className="flex items-center gap-6">
			<Button className="w-16 h-16 rounded-full border gradient-border bg-surface text-white">
				<SearchIcon className="w-6! h-6!" />
			</Button>

			<Button className="w-16 h-16 rounded-full border gradient-border bg-surface text-white">
				<BellIcon className="w-6! h-6!" />
			</Button>
		</div>
	);
};
