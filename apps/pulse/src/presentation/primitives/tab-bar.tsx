'use client';

import { areRectsEqual } from '@/core/utils/are-rects-equals';
import { measureButtons } from '@/core/utils/measure-buttons';
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


const SPRING_TRANSITION = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
  mass: 0.1,
} as const;

const STRETCH_AMOUNT = 24;

interface TabBarButtonProps {
  item: TabItem;
  isActive: boolean;
  isHovered: boolean;
  isPending: boolean;
  disableAnimations: boolean;
  hoverLayoutId: string;
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
    hoverLayoutId,
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
        className="relative z-10 h-full w-fit px-8 rounded-none border-none bg-transparent cursor-pointer outline-none transition-colors"
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
            // FIX 1: layoutId is now scoped per TabBar instance via hoverLayoutId prop,
            // preventing Framer Motion from sharing the hover mask across multiple instances.
            layoutId={hoverLayoutId}
            className="absolute inset-px rounded-full pointer-events-none -z-10"
            style={{ backgroundColor: 'rgba(62, 60, 72, 0.4)' }}
            transition={disableAnimations ? { duration: 0 } : SPRING_TRANSITION}
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

        {/* Text label */}
        <span className="relative z-10 text-white font-sans font-light text-[1.12rem] select-none pointer-events-none whitespace-nowrap">
          {item.label}
        </span>
      </motion.button>
    );
  }
);
TabBarButton.displayName = 'TabBarButton';

// Main component

export const TabBar = memo(
  ({ items, activeId, onChange, className, gap = 16 }: TabBarProps) => {
    const shouldReduceMotion = useReducedMotion();
    const isLowFPS = useLowFPS();
    const disableAnimations = shouldReduceMotion || isLowFPS;

    // Generate a stable instance-scoped ID so layoutId is never shared
    // between multiple TabBar instances rendered on the same page.
    const instanceId = useId();
    const hoverLayoutId = `${instanceId}-nav-hover-mask`;
    const patternId = `${instanceId}-pattern`;

    const [hoveredId, setHoveredId] = useState<string | number | null>(null);
    const [pendingId, setPendingId] = useState<string | number | null>(null);
    const [tappedId, setTappedId] = useState<string | number | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    // Store rects in a ref instead of state to avoid unnecessary re-renders.
    // Rect measurements only feed motion values; they don't need to drive React re-renders.
    const navRectsRef = useRef<{ left: number; width: number }[]>([]);

    // Keep a separate piece of state only to signal that rects have been
    // measured for the first time (so the active mask renders on first paint).
    const [hasRects, setHasRects] = useState(false);

    const activeIndex = useMemo(
      () => items.findIndex((item) => item.id === activeId),
      [items, activeId]
    );
    const prevIndexRef = useRef(-1);

    const maskX = useMotionValue(0);
    const maskWidth = useMotionValue(0);
    const patternX = useTransform(maskX, (x) => -x);

    // This handles external navigation (router, back/forward) where no click
    // occurs, which would previously leave the pending spinner stuck forever.
    useEffect(() => {
      setPendingId(null);
    }, [activeId]);

    const handleClick = useCallback(
      (id: string | number) => {
        setPendingId(id);
        onChange(id);
      },
      [onChange]
    );

    const handleHoverStart = useCallback((id: string | number) => setHoveredId(id), []);
    const handleHoverEnd = useCallback(() => setHoveredId(null), []);
    const handleTapStart = useCallback((id: string | number) => setTappedId(id), []);
    const handleTapEnd = useCallback(() => setTappedId(null), []);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      let rafId: number;

      const update = () => {
        const next = measureButtons(container, items.length);
        if (!next) return;
        if (!areRectsEqual(navRectsRef.current, next)) {
          navRectsRef.current = next;
          // Signal first-paint readiness exactly once.
          setHasRects(true);
        }
      };

      const scheduleUpdate = () => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(update);
      };

      scheduleUpdate();

      const ro = new ResizeObserver(scheduleUpdate);
      ro.observe(container);

      return () => {
        cancelAnimationFrame(rafId);
        ro.disconnect();
      };
    }, [items.length]);

    // Animate the active selection mask whenever the active tab or the
    // measured rects change.
    useEffect(() => {
      const rects = navRectsRef.current;
      if (!hasRects || rects.length === 0 || activeIndex === -1) return;

      const current = rects[activeIndex];
      if (!current) return;

      const ctl = { cancelled: false };

      const runSequence = async () => {
        const prevIndex = prevIndexRef.current;

        if (prevIndex !== -1 && prevIndex !== activeIndex) {
          const prev = rects[prevIndex];

          if (prev && !disableAnimations) {
            const moveRight = current.left > prev.left;

            // Anticipation stretch toward the target edge.
            await Promise.all([
              animate(
                maskX,
                moveRight ? prev.left : prev.left - STRETCH_AMOUNT,
                { duration: 0.1, ease: 'easeOut' }
              ),
              animate(maskWidth, prev.width + STRETCH_AMOUNT, {
                duration: 0.1,
                ease: 'easeOut',
              }),
            ]);

            // Guard after the await — component may have unmounted
            // or activeIndex may have changed while the stretch was running.
            if (ctl.cancelled) return;
          }
        }

        // Main translation to the target position.
        animate(maskX, current.left, disableAnimations ? { duration: 0 } : SPRING_TRANSITION);
        animate(maskWidth, current.width, disableAnimations ? { duration: 0 } : SPRING_TRANSITION);

        prevIndexRef.current = activeIndex;
      };

      void runSequence();

      return () => {
        ctl.cancelled = true;
      };
    }, [activeIndex, hasRects, maskX, maskWidth, disableAnimations]);

    // Derive resolvedHoverId with useMemo so it's not recomputed inline
    // on every render pass.
    const resolvedHoverId = useMemo(
      () => hoveredId ?? activeId,
      [hoveredId, activeId]
    );

    return (
      <div
        role="tablist"
        aria-orientation="horizontal"
        ref={containerRef}
        className={cn(
          'relative flex items-center h-16 bg-surface p-0 rounded-full gradient-border z-0 backdrop-blur-xl',
          className
        )}
      >
        {/* Active selection mask — slides across tabs */}
        {hasRects && activeIndex !== -1 && (
          <motion.div
            className="absolute top-0 bottom-0 bg-active overflow-hidden rounded-full pointer-events-none z-0"
            style={{ x: maskX, width: maskWidth }}
            animate={{
              scale: disableAnimations ? 1 : tappedId === activeId ? 0.95 : 1,
            }}
            transition={disableAnimations ? { duration: 0 } : SPRING_TRANSITION}
          >
            {/* Counter-translating pattern keeps the slash static */}
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
            hoverLayoutId={hoverLayoutId}
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
TabBar.displayName = 'TabBar';
