'use client';
import { ParentSize } from '@visx/responsive';
import type { OrderData } from '../lib/orders-status-chart.types';
import OrderStatusPillInner from './status-pill-inner';

export default function OrderStatusPill({ data }: { data: OrderData }) {
	return (
		<div className="w-2xl border">
			<ParentSize debounceTime={100}>
				{({ width }) =>
					width > 0 ? <OrderStatusPillInner data={data} width={width} /> : null
				}
			</ParentSize>
		</div>
	);
}
