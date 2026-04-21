'use client';

import { icons } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/core/utils/utils';
import { Input } from '@/presentation/primitives/input';
import { Button } from './button';

interface IconSelectorProps {
	value?: string;
	onChange?: (iconName: string) => void;
	onBlur?: () => void;
	'aria-invalid'?: boolean;
	className?: string;
}

// Define a baseline set of default icons to display prior to user input
const DEFAULT_ICONS: Array<keyof typeof icons> = [
	'Store',
	'ShoppingBag',
	'Tag',
	'Box',
	'CreditCard',
];

export function IconSelector({
	value,
	onChange,
	onBlur,
	'aria-invalid': isInvalid,
	className,
}: IconSelectorProps) {
	// Local state strictly manages the search input scalar
	const [searchTerm, setSearchTerm] = useState('');

	// Memoized derivation of the top 5 icon candidates based on string inclusion
	const matchedIcons = useMemo(() => {
		if (!searchTerm.trim()) {
			return DEFAULT_ICONS;
		}

		const normalizedTerm = searchTerm.toLowerCase();

		return (Object.keys(icons) as Array<keyof typeof icons>)
			.filter((name) => name.toLowerCase().includes(normalizedTerm))
			.slice(0, 5);
	}, [searchTerm]);

	return (
		<div className={cn('flex flex-col gap-6 w-full', className)}>
			<Input
				type="text"
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				onBlur={onBlur}
				placeholder="Search for an icon (e.g., store, wallet)..."
				aria-invalid={isInvalid}
			/>

			<div className="flex flex-row justify-start items-center h-14 w-full px-2">
				<div className="flex flex-row justify-start items-start gap-6 w-full">
					{matchedIcons.length > 0 ? (
						matchedIcons.map((iconName) => {
							// Dynamically assign the component reference
							const IconComponent = icons[iconName];
							const isSelected = value === iconName;

							return (
								<Button
									key={iconName}
									onClick={() => onChange?.(iconName)}
									aria-pressed={isSelected}
									variant="secondary"
									className={cn(
										'h-16! w-16!',
										isSelected
											? 'gradient-border-glow bg-active!'
											: 'border-gradient bg-surface'
									)}
								>
									<IconComponent className="size-6 shrink-0" />
								</Button>
							);
						})
					) : (
						<div className="flex flex-1 items-center justify-center h-full rounded-2xl bg-input/30 text-sm text-muted-foreground border border-transparent">
							No matching icons found.
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
