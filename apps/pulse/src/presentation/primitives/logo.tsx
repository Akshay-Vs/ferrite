import { cva, type VariantProps } from 'class-variance-authority';
import PulseIcon from '@/presentation/shapes/pulse-icon';

const logoVariants = cva('object-center object-cover', {
	variants: {
		size: {
			default: 'h-12 w-12',
			sm: 'h-8 w-8',
			lg: 'h-14 w-14',
			xl: 'h-18 w-18',
			'2xl': 'h-24 w-24',
			'3xl': 'h-26 w-26',
		},
	},
	defaultVariants: {
		size: 'default',
	},
});

export const Logo = ({
	size = 'default',
	strokeWidth = 2,
}: VariantProps<typeof logoVariants> & { strokeWidth?: number }) => {
	return (
		<div className="flex items-center justify-center bg-transparent h-fit w-fit">
			<PulseIcon className={logoVariants({ size })} strokeWidth={strokeWidth} />
		</div>
	);
};
