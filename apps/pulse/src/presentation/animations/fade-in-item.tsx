'use client';

import { motion, type Variants } from 'motion/react';

const FadeInItem = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	const itemVariants: Variants = {
		hidden: {
			filter: 'blur(8px)',
		},
		visible: {
			filter: 'blur(0px)',
			transition: {
				type: 'tween',
				ease: 'easeOut',
				duration: 0.05,
			},
		},
	};
	return (
		<motion.div variants={itemVariants} className={className}>
			{children}
		</motion.div>
	);
};

export default FadeInItem;
