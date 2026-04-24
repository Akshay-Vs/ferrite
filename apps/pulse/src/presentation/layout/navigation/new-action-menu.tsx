import { HousePlus, LayersPlus, PackagePlus, Plus } from 'lucide-react';
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

const NewActionMenu = () => {
	return (
		<DropdownMenu>
			<Tooltip>
				<Button
					size="icon"
					aria-label="Create New"
					aria-haspopup="true"
					aria-description="Opens a menu with options to create new items"
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

					<DropdownMenuItem>
						<PackagePlus />
						Create New Product
					</DropdownMenuItem>

					<DropdownMenuItem>
						<HousePlus />
						Create New Store
					</DropdownMenuItem>

					<DropdownMenuItem>
						<LayersPlus />
						Create New Order
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default NewActionMenu;
