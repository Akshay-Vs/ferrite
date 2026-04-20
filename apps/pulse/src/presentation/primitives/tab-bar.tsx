'use client';

import { useLowFPS } from '@core/hooks/use-low-fps';
import { cn } from '@core/utils/utils';
import { Slash } from '@presentation/shapes/slash';
import {
	animate,
	motion,
	useMotionValue,
	useReducedMotion,
	useTransform,
} from 'motion/react';
import {
	memo,
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from 'react';

export type TabItem = {
	id: string | number;
	label: React.ReactNode;
};

export interface TabBarProps {
	items: TabItem[];
	activeId: string | number;
	onChange: (id: string | number) => void;
	className?: string;
	gap?: number;
}

const springTransition = {
	type: 'spring',
	stiffness: 400,
	damping: 25,
	mass: 0.1,
} as const;

interface TabBarButtonProps {
	item: TabItem;
	isActive: boolean;
	isHovered: boolean;
	isPending: boolean;
	disableAnimations?: boolean;
	onHoverStart: (id: string | number) => void;
	onHoverEnd: () => void;
	onClick: (id: string | number) => void;
	onTapStart: (id: string | number) => void;
	onTapEnd: () => void;
}

const TabBarButton = memo(
	({
		item,
		isActive,
		isHovered,
		isPending,
		disableAnimations,
		onHoverStart,
		onHoverEnd,
		onClick,
		onTapStart,
		onTapEnd,
	}: TabBarButtonProps) => {
		return (
			<motion.button
				type="button"
				aria-current={isActive ? 'page' : undefined}
				className="relative z-10 h-full w-fit px-8 rounded-none border-none bg-transparent cursor-pointer outline-none  transition-colors"
				onMouseEnter={() => onHoverStart(item.id)}
				onMouseLeave={onHoverEnd}
				onFocus={() => onHoverStart(item.id)}
				onBlur={onHoverEnd}
				onClick={() => onClick(item.id)}
				onPointerDown={() => onTapStart(item.id)}
				onPointerUp={onTapEnd}
				onPointerLeave={onTapEnd}
				onPointerCancel={onTapEnd}
				whileTap={{ scale: disableAnimations ? 1 : 0.95 }}
			>
				{/* Layer 1: Hover indicator */}
				{isHovered && !isPending && (
					<motion.div
						layoutId="nav-hover-mask"
						className="absolute inset-px rounded-full pointer-events-none -z-10"
						style={{ backgroundColor: 'rgba(62, 60, 72, 0.4)' }}
						transition={disableAnimations ? { duration: 0 } : springTransition}
					/>
				)}

				{/* Layer 1.5: Pending indicator */}
				{isPending && (
					<motion.div
						className="absolute inset-px rounded-full pointer-events-none -z-10 bg-active"
						initial={{ opacity: 0.23 }}
						animate={{ opacity: disableAnimations ? 0.5 : [0.23, 0.5, 0.23] }}
						transition={
							disableAnimations
								? { duration: 0 }
								: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
						}
					/>
				)}

				{/* Text label - always on top */}
				<span className="relative z-10 text-white font-sans font-light text-[1.12rem] select-none pointer-events-none whitespace-nowrap">
					{item.label}
				</span>
			</motion.button>
		);
	}
);
TabBarButton.displayName = 'TabBarButton';

export const TabBar = memo(
	({ items, activeId, onChange, className, gap = 16 }: TabBarProps) => {
		const shouldReduceMotion = useReducedMotion();
		const isLowFPS = useLowFPS();
		const disableAnimations = shouldReduceMotion || isLowFPS;

		const [hoveredId, setHoveredId] = useState<string | number | null>(null);
		const [pendingId, setPendingId] = useState<string | number | null>(null);

		const [navRects, setNavRects] = useState<{ left: number; width: number }[]>(
			[]
		);
		const containerRef = useRef<HTMLDivElement>(null);
		const [tappedId, setTappedId] = useState<string | number | null>(null);

		const activeIndex = useMemo(
			() => items.findIndex((item) => item.id === activeId) ?? 0,
			[items, activeId]
		);
		const prevIndex = useRef(-1);

		const handleHoverStart = useCallback(
			(id: string | number) => setHoveredId(id),
			[]
		);
		const handleHoverEnd = useCallback(() => setHoveredId(null), []);
		const handleTapStart = useCallback(
			(id: string | number) => setTappedId(id),
			[]
		);
		const handleTapEnd = useCallback(() => setTappedId(null), []);

		const maskX = useMotionValue(0);
		const maskWidth = useMotionValue(0);
		const patternX = useTransform(maskX, (x) => -x);
		const patternId = useId();

		useEffect(() => {
			setPendingId(null);
		}, []);

		const handleClick = useCallback(
			(id: string | number) => {
				setPendingId(id);
				onChange(id);
			},
			[onChange]
		);

		useEffect(() => {
			if (!containerRef.current) return;
			const update = () => {
				const buttons = containerRef.current?.querySelectorAll('button');
				if (buttons && buttons.length === items.length) {
					setNavRects((prev) => {
						const newRects = Array.from(buttons).map((b) => ({
							left: b.offsetLeft,
							width: b.offsetWidth,
						}));

						if (
							prev.length === newRects.length &&
							prev.every(
								(p, i) =>
									p.left === newRects[i].left && p.width === newRects[i].width
							)
						) {
							return prev;
						}
						return newRects;
					});
				}
			};
			update();
			const timer = setTimeout(update, 100);
			window.addEventListener('resize', update);
			return () => {
				clearTimeout(timer);
				window.removeEventListener('resize', update);
			};
		}, [items.length]);

		useEffect(() => {
			if (navRects.length === 0 || activeIndex === -1) return;

			const current = navRects[activeIndex];
			if (!current) return;

			let cancelled = false;

			if (activeIndex !== prevIndex.current && prevIndex.current !== -1) {
				const prev = navRects[prevIndex.current];
				if (prev) {
					const moveRight = current.left > prev.left;
					const stretchAmount = 24; // Elastic stretch in pixels

					const sequence = async () => {
						// 1. Anticipation stretch: expand edge towards the target
						if (!disableAnimations) {
							await Promise.all([
								animate(
									maskX,
									moveRight ? prev.left : prev.left - stretchAmount,
									{ duration: 0.1, ease: 'easeOut' }
								),
								animate(maskWidth, prev.width + stretchAmount, {
									duration: 0.1,
									ease: 'easeOut',
								}),
							]);
						}

						if (cancelled) return;

						// 2. Main translation: snap to target seamlessly
						animate(
							maskX,
							current.left,
							disableAnimations ? { duration: 0 } : springTransition
						);
						animate(
							maskWidth,
							current.width,
							disableAnimations ? { duration: 0 } : springTransition
						);
					};
					void sequence();
				} else {
					maskX.set(current.left);
					maskWidth.set(current.width);
				}
			} else {
				maskX.set(current.left);
				maskWidth.set(current.width);
			}

			prevIndex.current = activeIndex;

			return () => {
				cancelled = true;
			};
		}, [activeIndex, navRects, maskX, maskWidth, disableAnimations]);

		const resolvedHoverId = hoveredId ?? activeId;

		return (
			<div
				ref={containerRef}
				className={cn(
					'relative flex items-center h-16 bg-surface p-0 rounded-full gradient-border z-0 backdrop-blur-xl',
					className
				)}
			>
				{/*
        Layer 2: Absolute Active Selection Mask (detached).
        Slides seamlessly across the buttons while perfectly countering the movement
        on the inner patterned background to keep the pattern stationary.
      */}
				{navRects.length > 0 && activeIndex !== -1 && (
					<motion.div
						className="absolute top-0 bottom-0 bg-active overflow-hidden rounded-full pointer-events-none z-0"
						style={{ x: maskX, width: maskWidth }}
						animate={{
							scale: disableAnimations ? 1 : tappedId === activeId ? 0.95 : 1,
						}}
						transition={disableAnimations ? { duration: 0 } : springTransition}
					>
						{/* Inverse translating static inner pattern */}
						<motion.div
							className="absolute top-0 bottom-0 w-500 pointer-events-none"
							style={{ x: patternX }}
						>
							<Slash gap={gap} id={patternId} />
						</motion.div>
					</motion.div>
				)}

				{items.map((item) => (
					<TabBarButton
						key={item.id}
						item={item}
						isActive={activeId === item.id}
						isHovered={resolvedHoverId === item.id}
						isPending={pendingId === item.id}
						disableAnimations={disableAnimations}
						onHoverStart={handleHoverStart}
						onHoverEnd={handleHoverEnd}
						onClick={handleClick}
						onTapStart={handleTapStart}
						onTapEnd={handleTapEnd}
					/>
				))}
			</div>
		);
	}
);
