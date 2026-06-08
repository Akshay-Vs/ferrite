'use client';

import { scaleLinear } from '@visx/scale';
import { useMemo, useState } from 'react';
import type { SegmentSlice } from '../lib/orders-status-chart.helpers';
import {
	buildSlices,
	spreadLabelPositions,
} from '../lib/orders-status-chart.helpers';
import type { OrderData, SegDef } from '../lib/orders-status-chart.types';
import {
	ANGLE_OFFSET_X,
	LEGEND_GAP_Y,
	PILL_HEIGHT,
} from '../lib/orders-status-chart.types';

// ─ legend item

export interface LegendItem {
	slice: SegmentSlice;
	/** pixel x for the label text (offset for angled line) */
	labelX: number;
	/** pixel x anchored to the segment center (for the dot) */
	anchorX: number;
	/** pixel y for the dot (relative to pill top = 0) */
	dotY: number;
	/** pixel y for the pill edge nearest this legend */
	pillEdgeY: number;
	above: boolean;
	staggerIndex: number;
}

// hook

export function useOrderStatusPill(data: OrderData, width: number) {
	const [hovered, setHovered] = useState(false);
	const total =
		data.delivered +
		data.inTransit +
		data.processing +
		data.returned +
		data.cancelled;

	const radius = PILL_HEIGHT / 2;

	//  x-scale: proportion (0–1) → pixel
	const xScale = useMemo(
		() =>
			scaleLinear<number>({
				domain: [0, 1],
				range: [0, width],
			}),
		[width]
	);

	//  segment defs
	const defaultDefs = useMemo<SegDef[]>(
		() => [
			{
				key: 'delivered',
				count: data.delivered + data.inTransit,
				label: 'Delivered / In transit',
				above: true,
			},
			{
				key: 'processing',
				count: data.processing,
				label: 'Processing',
				above: true,
			},
			{
				key: 'returned',
				count: data.cancelled + data.returned,
				label: 'Returned / Cancelled',
				above: false,
			},
		],
		[
			data.delivered,
			data.inTransit,
			data.processing,
			data.cancelled,
			data.returned,
		]
	);

	const expandedDefs = useMemo<SegDef[]>(
		() => [
			{
				key: 'delivered',
				count: data.delivered,
				label: 'Delivered',
				above: true,
			},
			{
				key: 'inTransit',
				count: data.inTransit,
				label: 'In transit',
				above: false,
			},
			{
				key: 'processing',
				count: data.processing,
				label: 'Processing',
				above: true,
			},
			{
				key: 'returned',
				count: data.returned,
				label: 'Returned',
				above: false,
			},
			{
				key: 'cancelled',
				count: data.cancelled,
				label: 'Cancelled',
				above: true,
			},
		],
		[
			data.delivered,
			data.inTransit,
			data.processing,
			data.returned,
			data.cancelled,
		]
	);

	//  slices (proportion-based)
	const slices = useMemo(() => {
		if (total === 0) return [];
		const defs = hovered ? expandedDefs : defaultDefs;
		return buildSlices(defs, total);
	}, [hovered, defaultDefs, expandedDefs, total]);

	//  legends with pixel positions via xScale
	const legends = useMemo<LegendItem[]>(() => {
		if (total === 0) return [];

		const aboveSlices = slices.filter((s) => s.def.above);
		const belowSlices = slices.filter((s) => !s.def.above);

		// Natural label x from segment center + angle offset
		const aboveNatural = aboveSlices.map((s) => xScale(s.mid) + ANGLE_OFFSET_X);
		const belowNatural = belowSlices.map((s) => xScale(s.mid) + ANGLE_OFFSET_X);

		const aboveLabelXs = spreadLabelPositions(aboveNatural, width);
		const belowLabelXs = spreadLabelPositions(belowNatural, width);

		const items: LegendItem[] = [];
		let idx = 0;

		// Interleave for natural left-to-right reveal
		const maxLen = Math.max(aboveSlices.length, belowSlices.length);
		for (let i = 0; i < maxLen; i++) {
			if (i < aboveSlices.length) {
				const slice = aboveSlices[i];
				items.push({
					slice,
					labelX: aboveLabelXs[i],
					anchorX: xScale(slice.mid),
					dotY: -LEGEND_GAP_Y,
					pillEdgeY: 0,
					above: true,
					staggerIndex: idx++,
				});
			}
			if (i < belowSlices.length) {
				const slice = belowSlices[i];
				items.push({
					slice,
					labelX: belowLabelXs[i],
					anchorX: xScale(slice.mid),
					dotY: PILL_HEIGHT + LEGEND_GAP_Y,
					pillEdgeY: PILL_HEIGHT,
					above: false,
					staggerIndex: idx++,
				});
			}
		}
		return items;
	}, [slices, xScale, width, total]);

	return {
		hovered,
		setHovered,
		xScale,
		radius,
		total,
		slices,
		legends,
	};
}
