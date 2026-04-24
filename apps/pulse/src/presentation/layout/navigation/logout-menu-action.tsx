import { useClerk } from '@clerk/nextjs';
import { LogOutIcon } from 'lucide-react';
import { LOGIN } from '@/core/constants/routes.constants';
import { DropdownMenuItem } from '@/presentation/primitives/dropdown-menu';
import { toast } from '@/presentation/primitives/sonner';

const LogoutMenuAction = () => {
	const { signOut } = useClerk();

	const handleLogout = async () => {
		try {
			await signOut({ redirectUrl: LOGIN });
		} catch (error) {
			toast.error('Failed to logout', {
				description: 'Please try again later.',
				action: {
					label: 'Retry',
					onClick: handleLogout,
				},
			});
		}
	};

	return (
		<DropdownMenuItem onClick={handleLogout}>
			<LogOutIcon className="w-4 h-4" />
			Logout
		</DropdownMenuItem>
	);
};

export default LogoutMenuAction;
