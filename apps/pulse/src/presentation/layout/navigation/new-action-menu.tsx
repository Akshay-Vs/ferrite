import type { BaseUIEvent } from '@base-ui/react';
import { HousePlus, LayersPlus, PackagePlus, Plus } from 'lucide-react';
import { type MouseEvent, useState } from 'react';
import { Button } from '@/presentation/primitives/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '@/presentation/primitives/dropdown-menu';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/presentation/primitives/tooltip';
import CreateStoreDialog from '@/presentation/widgets/create-store/components/create-store-dialog';

type dialog = 'product' | 'store' | 'order' | null;

const NewActionMenu = () => {
	const [openDialog, setOpenDialog] = useState<dialog>(null);

	const onOpen = (e: BaseUIEvent<MouseEvent>, dialog: dialog) => {
		e.stopPropagation();
		setOpenDialog(dialog);
	};

	return (
		<>
			<DropdownMenu>
				<Tooltip>
					<Button
						size="icon"
						aria-label="Create New"
						render={
							<TooltipTrigger
								render={
									<DropdownMenuTrigger>
										<Plus className="w-6! h-6!" />
									</DropdownMenuTrigger>
								}
							/>
						}
					/>
					<TooltipContent>Create New</TooltipContent>
				</Tooltip>

				<DropdownMenuContent className="w-fit">
					<DropdownMenuGroup>
						<DropdownMenuLabel>Create New</DropdownMenuLabel>
						<DropdownMenuItem onSelect={() => setOpenDialog('product')}>
							<PackagePlus />
							Create New Product
						</DropdownMenuItem>

						<DropdownMenuItem onClick={(e) => onOpen(e, 'store')}>
							<HousePlus />
							Create New Store
						</DropdownMenuItem>

						<DropdownMenuItem onSelect={() => setOpenDialog('order')}>
							<LayersPlus />
							Create New Order
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Dialogs are siblings to DropdownMenu — they survive its unmount */}
			<CreateStoreDialog
				open={openDialog === 'store'}
				onOpenChange={(open) => !open && setOpenDialog(null)}
			/>
		</>
	);
};

export default NewActionMenu;
