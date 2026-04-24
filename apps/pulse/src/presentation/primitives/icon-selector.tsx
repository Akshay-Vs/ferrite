'use client';

import { icons } from 'lucide-react';
import { useMemo, useState, useTransition } from 'react';
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

const ALL_ICON_KEYS = Object.keys(icons) as Array<keyof typeof icons>;

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
	const [searchTerm, setSearchTerm] = useState('');
	const [deferredTerm, setDeferredTerm] = useState('');
	const [isPending, startTransition] = useTransition();

	/** Updates the scalar search term immediately, but defers the filter computation. */
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const nextValue = e.target.value;
		setSearchTerm(nextValue);
		startTransition(() => {
			setDeferredTerm(nextValue);
		});
	};

	const matchedIcons = useMemo(() => {
		const query = deferredTerm.trim().toLowerCase();
		if (!query) return DEFAULT_ICONS;

		const results: Array<keyof typeof icons> = [];
		// Early-exit iteration: O(k) where k is the limit, rather than O(n)
		for (let i = 0; i < ALL_ICON_KEYS.length; i++) {
			if (ALL_ICON_KEYS[i].toLowerCase().includes(query)) {
				results.push(ALL_ICON_KEYS[i]);
			}
			if (results.length >= 5) break;
		}
		return results;
	}, [deferredTerm]);

	return (
		<div className={cn('flex flex-col gap-6 w-full', className)}>
			<div className="relative">
				<Input
					type="text"
					value={searchTerm}
					onChange={handleSearchChange}
					onBlur={onBlur}
					placeholder="Search for an icon (e.g., store, wallet)..."
					aria-invalid={isInvalid}
					className={cn(isPending && 'opacity-70 transition-opacity')}
				/>
				{isPending && (
					<div className="absolute right-3 top-1/2 -translate-y-1/2 size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
				)}
			</div>

			<div className="flex flex-row justify-start items-center h-16 w-full px-2">
				<div className="flex flex-row justify-start items-start gap-4 w-full">
					{matchedIcons.length > 0 ? (
						matchedIcons.map((iconName) => {
							const IconComponent = icons[iconName];
							const isSelected = value === iconName;

							return (
								<Button
									key={iconName}
									type="button"
									onClick={() => onChange?.(iconName)}
									aria-label={`Select ${iconName} icon`}
									aria-pressed={isSelected}
									className={cn(
										'h-14 w-14 p-0 flex items-center justify-center transition-all',
										isSelected
											? 'ring-2 ring-primary bg-accent'
											: 'border border-input bg-background hover:bg-accent'
									)}
								>
									<IconComponent className="size-6 shrink-0" />
								</Button>
							);
						})
					) : (
						<div className="flex flex-1 items-center justify-center h-14 rounded-md bg-muted/30 text-sm text-muted-foreground border border-dashed">
							No matching icons found.
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
