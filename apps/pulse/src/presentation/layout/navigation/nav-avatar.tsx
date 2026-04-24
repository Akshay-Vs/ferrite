'use client';

import { useUser } from '@clerk/nextjs';
import { Avatar, AvatarImage } from '@presentation/primitives/avatar';
import { Skeleton } from '@presentation/primitives/skeleton';
import { ReceiptText, UserCog2, Users2 } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/presentation/primitives/dropdown-menu';
import LogoutMenuAction from './logout-menu-action';

export const NavAvatar = () => {
	const { isLoaded, isSignedIn, user } = useUser();

	if (!isLoaded) {
		return (
			<Skeleton className="rounded-full border gradient-border bg-surface w-16 h-16" />
		);
	}

	if (!isSignedIn || !user) {
		return null;
	}

	const initials =
		`${user.firstName?.[0] ?? 'x'}${user.lastName?.[0] ?? 'x'}`.toUpperCase();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className="h-16 w-16! border-2 border-transparent rounded-full"
				aria-label="Open user menu"
				aria-haspopup="menu"
			>
				<Avatar className="full">
					<AvatarImage
						src={user.imageUrl || ''}
						alt={initials}
						height={60}
						width={60}
					/>
				</Avatar>
			</DropdownMenuTrigger>

			<DropdownMenuContent className="w-fit">
				<DropdownMenuGroup>
					<DropdownMenuLabel>My Account</DropdownMenuLabel>
					<DropdownMenuItem>
						<UserCog2 />
						Profile Settings
					</DropdownMenuItem>
					<DropdownMenuItem>
						<ReceiptText />
						Billing Settings
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<Users2 />
						Team
					</DropdownMenuItem>

					<LogoutMenuAction />
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
