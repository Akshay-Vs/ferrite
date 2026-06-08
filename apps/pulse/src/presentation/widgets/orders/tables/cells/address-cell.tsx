import type { Order } from '../../lib/orders-mock';
import type { OrdersRowProps } from '../../types/orders-row';

export const AddressCell = ({ row }: OrdersRowProps) => {
	const address = row.getValue('address') as Order['address'];
	const isExpanded = row.getIsExpanded();

	if (isExpanded) {
		return (
			<div className="w-full h-fit center">
				<div className="flex flex-col gap-1 py-2 text-start whitespace-normal w-60">
					<span className="font-medium">{address.street}</span>
					{address.landmark && (
						<span className="text-muted-foreground text-base mt-0.5">
							Near {address.landmark}
						</span>
					)}
					<span className="text-muted-foreground text-base wrap-break-word tracking-wide leading-4">
						{address.city}, {address.state} {address.zip}
					</span>

					<span className="text-muted-foreground text-sm">
						{address.country}
					</span>
				</div>
			</div>
		);
	}

	return (
		<div className="full center">
			<div className="w-60 truncate">
				{address.street}, {address.city}, {address.state}
			</div>
		</div>
	);
};
