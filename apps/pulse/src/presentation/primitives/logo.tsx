import PulseIcon from '@public/assets/images/pulse.svg';
import { cva, type VariantProps } from 'class-variance-authority';
import Image from 'next/image';

const logoVariants = cva('object-center object-cover', {
	variants: {
		size: {
			default: 'h-12 w-12',
			sm: 'h-8 w-8',
			lg: 'h-14 w-14',
		},
	},
	defaultVariants: {
		size: 'default',
	},
});

export const Logo = ({
	size = 'default',
}: VariantProps<typeof logoVariants>) => {
	return (
		<div className="flex items-center justify-center bg-background h-fit w-fit">
			<Image
				src={PulseIcon}
				alt="ferrite pulse logo"
				width={100}
				height={100}
				className={logoVariants({ size })}
			/>
		</div>
	);
};
