'use client';

import {
	AtSign,
	Ban,
	Command,
	ContactRound,
	Hash,
	Landmark,
	OctagonPause,
	Package,
	Printer,
	Truck,
	User2,
} from 'lucide-react';
import { copyToClipboard } from '@/core/utils/copy-to-clipboard';
import {
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuShortcut,
} from '@/presentation/primitives/context-menu';
import { sheetRouter } from '@/presentation/sheet-router/sheet-router.store';
import type { Order } from '../lib/orders-mock';

export interface RawDetailsMenuProps {
	rowId: string;
	data: Order;
}

/** Returns ContextMenuContent to be rendered inside a ContextMenu root.
 *  The DataTable provides the ContextMenu + Trigger wrapping at the row level. */
export function OrdersContextMenu({ rowId, data }: RawDetailsMenuProps) {
	return (
		<ContextMenuContent>
			<ContextMenuItem
				onClick={() =>
					sheetRouter.push('order-details', {
						orderId: rowId,
					})
				}
			>
				<Package className="size-4" />
				View Order Details
			</ContextMenuItem>

			<ContextMenuItem
				onClick={() =>
					sheetRouter.push('user-profile', {
						userId: data.user.id,
					})
				}
			>
				<ContactRound className="size-4" />
				View User Profile
			</ContextMenuItem>

			<ContextMenuItem
				onClick={() =>
					sheetRouter.push('shipment-details', {
						orderId: rowId,
					})
				}
			>
				<Truck className="size-4" />
				View Shipment Details
			</ContextMenuItem>

			<ContextMenuItem
				onClick={() =>
					sheetRouter.push('payment-details', {
						transactionId: 'NOT IMPLEMENTED',
					})
				}
			>
				<Landmark className="size-4" />
				View Transaction Details
			</ContextMenuItem>

			<ContextMenuSeparator />

			<ContextMenuItem onClick={() => copyToClipboard(rowId)}>
				<Hash className="size-4" />
				Copy Order ID
				<span className="ml-auto flex items-center text-xs text-muted-foreground opacity-60 font-mono">
					(
					<span className="max-w-18 truncate inline-block align-bottom">
						{rowId}
					</span>
					)
				</span>
			</ContextMenuItem>

			<ContextMenuItem onClick={() => copyToClipboard(data.user.id)} hidden>
				<User2 className="size-4" />
				Copy User ID
				<span className="ml-auto flex items-center text-xs text-muted-foreground opacity-60 font-mono">
					(
					<span className="max-w-18 truncate inline-block align-bottom">
						{data.user.id}
					</span>
					)
				</span>
			</ContextMenuItem>

			<ContextMenuItem onClick={() => copyToClipboard(data.user.email)}>
				<AtSign className="size-4" />
				Copy User Email
				<span className="ml-auto flex items-center text-xs text-muted-foreground opacity-60 font-mono">
					(
					<span className="max-w-18 truncate inline-block align-bottom">
						{data.user.email}
					</span>
					)
				</span>
			</ContextMenuItem>
			<ContextMenuSeparator />

			<ContextMenuItem onClick={() => alert('Not implemented')}>
				<Printer className="size-4" />
				Print Invoice
				<ContextMenuShortcut>
					<Command className="size-3.5" />P
				</ContextMenuShortcut>
			</ContextMenuItem>

			<ContextMenuItem onClick={() => alert('Not implemented')}>
				<OctagonPause className="size-4" />
				Halt Order
			</ContextMenuItem>

			<ContextMenuItem
				variant="destructive"
				onClick={() => alert('Not implemented')}
			>
				<Ban className="size-4" />
				Cancel Order
			</ContextMenuItem>
		</ContextMenuContent>
	);
}
