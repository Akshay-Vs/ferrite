'use client';

import { motion, type Variants } from 'motion/react';

interface SlideScreenProps {
	children: React.ReactNode;
	direction: 'forward' | 'backward';
	className?: string;
}

const slideVariants: Variants = {
	enter: (direction: 'forward' | 'backward') => ({
		x: direction === 'forward' ? '50%' : '-50%',
		opacity: 0,
		filter: 'blur(8px)',
	}),
	center: {
		x: '0%',
		opacity: 1,
		filter: 'blur(0px)',
	},
	exit: (direction: 'forward' | 'backward') => ({
		x: direction === 'forward' ? '-50%' : '50%',
		opacity: 0,
		filter: 'blur(8px)',
	}),
};

const slideTransition = {
	type: 'spring' as const,
	stiffness: 400,
	damping: 35,
	mass: 0.8,
};

/**
 * Wraps a sheet screen with directional slide animation.
 * Used by SheetRouter to animate push/pop transitions.
 */
const SlideScreen = ({ children, direction, className }: SlideScreenProps) => {
	return (
		<motion.div
			className={className}
			custom={direction}
			variants={slideVariants}
			initial="enter"
			animate="center"
			exit="exit"
			transition={slideTransition}
		>
			{children}
		</motion.div>
	);
};

export default SlideScreen;
