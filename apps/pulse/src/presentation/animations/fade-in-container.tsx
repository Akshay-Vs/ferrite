'use client';

import { motion, type Variants } from 'motion/react';

const FadeInContainer = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	const containerVariants: Variants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	return (
		<motion.div
			className={className}
			variants={containerVariants}
			initial="hidden" /* INITIATES THE STARTING STATE */
			animate="visible" /* TRIGGERS THE TRANSITION CASCADE */
			exit="hidden"
		>
			{children}
		</motion.div>
	);
};

export default FadeInContainer;
