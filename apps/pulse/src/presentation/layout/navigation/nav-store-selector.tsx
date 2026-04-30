'use client';

import { useEffect, useState } from 'react';
import {
	setSelectedStore,
	useStoreSelection,
} from '@/application/store/selected-store.store';
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
import { toast } from '@/presentation/primitives/sonner';

const MOCK_STORES = [
	{ id: '1', name: 'The Velvet Vault', icon: 'Gem' },
	{ id: '2', name: 'Evergreen Edibles', icon: 'Citrus' },
	{ id: '4', name: 'Circuit Cityscape', icon: 'Cpu' },
	{ id: '5', name: 'Urban Umbrella', icon: 'CloudRain' },
	{ id: '6', name: 'Midnight Muse', icon: 'Moon' },
	{ id: '7', name: 'Petal & Parchment', icon: 'BookOpen' },
	{ id: '8', name: 'Iron & Ivory', icon: 'Hammer' },
];

const fetchStoresAsync = async (): Promise<typeof MOCK_STORES> => {
	return new Promise((resolve) => {
		setTimeout(() => resolve(MOCK_STORES), 600);
	});
};

const NavStoreSelector = () => {
	const { selectedStoreId } = useStoreSelection();
	const [stores, setStores] = useState<typeof MOCK_STORES>([]);

	const [isMounted, setIsMounted] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		setIsMounted(true);
		let isActive = true;

		const runFetch = () => {
			setIsLoading(true);
			fetchStoresAsync()
				.then((data) => {
					if (!isActive) return;
					setStores(data);
					setIsLoading(false);

					const currentSelection = useStoreSelection.getState().selectedStoreId;
					const isSelectionValid = data.some(
						(store) => store.id === currentSelection
					);

					// Execute assignment and notify if the cached store is obsolete or null
					if ((!currentSelection || !isSelectionValid) && data.length > 0) {
						const fallbackStore = data[0];
						setSelectedStore(fallbackStore.id);

						// Deploy an informational toast denoting system-initiated state mutation
						toast.info(`Switched store to ${fallbackStore.name}`);
					}
				})
				.catch(() => {
					if (!isActive) return;
					toast.error('Failed to load stores. Please try again.', {
						action: { label: 'Retry', onClick: runFetch },
					});
				});
		};
		runFetch();

		return () => {
			isActive = false;
		};
	}, []);

	const handleChange = (id: string | null) => {
		if (!id) return;
		setSelectedStore(id);
	};

	if (!isMounted) return <Skeleton className="h-14 w-58 rounded-full" />;

	const isReady = !isLoading;
	const selectedStore = stores.find((s) => s.id === selectedStoreId);

	const activeValue =
		isReady && selectedStore ? String(selectedStore.id) : undefined;

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
								name={selectedStore.icon}
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
							<IconRenderer name={store.icon} className="size-4 shrink-0" />
							<span className="truncate">{store.name}</span>
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
};

export default NavStoreSelector;
