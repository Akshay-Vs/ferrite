'use client';

import { IconRenderer } from '@/presentation/primitives/icon-renderer';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/presentation/primitives/select';
import { Skeleton } from '@/presentation/primitives/skeleton';
import { useStoreSelector } from '../hooks/use-store-selector';

const NavStoreSelector = () => {
	const {
		isReady,
		isMounted,
		selectedStore,
		activeValue,
		handleChange,
		stores,
	} = useStoreSelector();

	if (!isMounted) return <Skeleton className="h-14 w-58 rounded-full" />;
	return (
		<Select
			key={isReady ? 'resolved' : 'pending'}
			value={activeValue}
			onValueChange={handleChange}
			disabled={!isReady}
		>
			<SelectTrigger className="w-58" aria-label="Select Store">
				<SelectValue placeholder={!isReady ? 'Loading...' : 'Select Store'}>
					{selectedStore && (
						<span className="flex gap-2.5 items-center text-foreground">
							<IconRenderer
								name={selectedStore.storeIcon || 'store'}
								className="size-4 shrink-0"
							/>
							<span className="truncate">{selectedStore.name}</span>
						</span>
					)}
				</SelectValue>
			</SelectTrigger>

			<SelectContent
				side="bottom"
				align="start"
				alignItemWithTrigger={false}
				sideOffset={8}
				className="w-full min-w-50"
			>
				<SelectGroup>
					{stores.map((store) => (
						<SelectItem
							key={store.id}
							value={String(store.id)}
							className="flex gap-4 items-center cursor-pointer w-full"
						>
							<IconRenderer
								name={store.storeIcon || 'store'}
								className="size-4 shrink-0"
							/>
							<span className="truncate">{store.name}</span>
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
};

export default NavStoreSelector;
