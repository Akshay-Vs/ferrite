import Image from 'next/image';
import CellActionButton from '../../components/cell-action-button';
import type { Order } from '../../lib/orders-mock';
import { openOrderSheet } from '../../stores/order-sheet-store';
import type { OrdersRowProps } from '../../types/orders-row';

export const UserCell = ({ row }: OrdersRowProps) => {
	const user = row.getValue('user') as Order['user'];
	const isExpanded = row.getIsExpanded();

	const handleOpenUserProfile = () => {
		openOrderSheet({
			activeSheet: 'user-profile',
			userId: user.id,
		});
	};

	if (isExpanded) {
		return (
			<div className="w-full h-fit center">
				<div className="flex items-start gap-3 py-1 min-w-0 w-56">
					<Image
						src={user.avatar}
						alt={`${user.name}'s avatar`}
						width={40}
						height={40}
						className="h-10 w-10 shrink-0 rounded-full object-cover object-center"
					/>
					<div className="flex flex-col min-w-0">
						<CellActionButton
							className="font-medium wrap-break-word text-start"
							value={user.name}
							action={handleOpenUserProfile}
						/>
						<p
							className="text-muted-foreground text-base font-medium truncate"
							title={user.email}
						>
							{user.email}
						</p>

						<p className="text-muted-foreground text-sm font-mono mt-1 truncate text-start">
							{user.id}
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full h-fit center">
			<div className="flex items-center gap-3 w-56">
				<Image
					src={user.avatar}
					alt={user.name}
					width={32}
					height={32}
					className="h-8 w-8 shrink-0 rounded-full object-cover border"
				/>
				<CellActionButton
					className="truncate"
					value={user.name}
					action={handleOpenUserProfile}
				/>
			</div>
		</div>
	);
};
