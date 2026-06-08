import { Group } from '@visx/group';
import { PatternLines } from '@visx/pattern';
import { Bar, Line } from '@visx/shape';
import { useOrderStatusPill } from '../hooks/use-order-status-pill';
import type { OrderData } from '../lib/orders-status-chart.types';
import {
	COLOR,
	PILL_HEIGHT,
	STRIPED_KEYS,
} from '../lib/orders-status-chart.types';

const OrderStatusPillInner = ({
	data,
	width,
}: {
	data: OrderData;
	width: number;
}) => {
	const { setHovered, xScale, radius, total, slices } = useOrderStatusPill(
		data,
		width
	);

	const patternId = 'pill-diag-stripes';
	const clipId = 'pill-clip';

	return (
		<figure
			aria-label="Order status breakdown"
			className={`relative m-0 transition-all'}`}
			style={{ width, height: PILL_HEIGHT }}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			{/* pill SVG */}
			<svg
				width={width}
				height={PILL_HEIGHT}
				role="img"
				aria-labelledby="order-status-title"
				className="block overflow-visible cursor-default"
			>
				<title id="order-status-title">Order status breakdown</title>

				<defs>
					{/* pill-shaped clip */}
					<clipPath id={clipId}>
						<rect
							x={0}
							y={0}
							width={width}
							height={PILL_HEIGHT}
							rx={radius}
							ry={radius}
						/>
					</clipPath>

					{/* diagonal stripe pattern */}
					<PatternLines
						id={patternId}
						width={10}
						height={10}
						orientation={['diagonal']}
						stroke="rgba(0,0,0,0.09)"
						strokeWidth={5}
					/>
				</defs>

				{/* segments */}
				<Group clipPath={`url(#${clipId})`}>
					{slices.map((slice) => {
						const x = xScale(slice.x0);
						const w = xScale(slice.x1) - x;
						const key = slice.def.key;

						return (
							<Group key={key}>
								<Bar
									x={x}
									y={0}
									width={w}
									height={PILL_HEIGHT}
									fill={COLOR[key]}
								/>
								{STRIPED_KEYS.includes(key) && (
									<Bar
										x={x}
										y={0}
										width={w}
										height={PILL_HEIGHT}
										fill={`url(#${patternId})`}
									/>
								)}
							</Group>
						);
					})}

					{/* dividers between segments */}
					{slices.slice(1).map((slice) => {
						const x = xScale(slice.x0);
						return (
							<Line
								key={`div-${slice.def.key}`}
								from={{ x, y: 0 }}
								to={{ x, y: PILL_HEIGHT }}
								stroke="rgba(0,0,0,0.18)"
								strokeWidth={1}
							/>
						);
					})}
				</Group>

				{/* hover: legend connectors (lines) */}
				{/* {hovered && */}
				{/*   legends.map((item) => { */}
				{/*     const delayMs = item.staggerIndex * STAGGER_DELAY_MS; */}
				{/*     const dotEdgeY = item.above ? item.dotY + 5 : item.dotY - 5; */}
				{/**/}
				{/*     return ( */}
				{/*       <g key={`legend-${item.slice.def.key}`}> */}
				{/*         angled line from pill edge to label area */}
				{/*         <Line */}
				{/*         	from={{ x: item.anchorX, y: item.pillEdgeY }} */}
				{/*         	to={{ x: item.labelX, y: dotEdgeY }} */}
				{/*         	stroke={COLOR[item.slice.def.key]} */}
				{/*         	strokeWidth={1.5} */}
				{/*         	className="animate-[legend-line-draw_300ms_ease-out_both]" */}
				{/*         	style={{ animationDelay: `${delayMs}ms` }} */}
				{/*         /> */}
				{/*       </g> */}
				{/*     ); */}
				{/*   })} */}
			</svg>

			{/* percentage labels inside pill (HTML, absolutely positioned) */}
			{slices.map((slice) => (
				<div
					key={`pct-${slice.def.key}`}
					className="absolute flex items-center justify-center font-semibold text-[15px] pointer-events-none select-none"
					style={{
						left: xScale(slice.mid),
						top: PILL_HEIGHT / 2,
						transform: 'translate(-50%, -50%)',
						color: 'rgba(0,0,0,0.55)',
					}}
				>
					{total > 0 ? Math.round((slice.def.count / total) * 100) : 0}%
				</div>
			))}

			{/* hover: HTML legend labels (Tailwind) */}
			{/* {hovered && */}
			{/* 	legends.map((item) => ( */}
			{/* 		<LegendLabel key={`label-${item.slice.def.key}`} item={item} /> */}
			{/* 	))} */}
		</figure>
	);
};

export default OrderStatusPillInner;
