'use client';

import { useUser } from '@clerk/nextjs';
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '@presentation/primitives/avatar';
import { Skeleton } from '@presentation/primitives/skeleton';

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
		<Avatar className="w-16 h-16 border-2 border-transparent">
			<AvatarImage src={user.imageUrl || ''} alt={initials} />
			<AvatarFallback>{initials || '?'}</AvatarFallback>
		</Avatar>
	);
};
