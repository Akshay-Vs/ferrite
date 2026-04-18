import { cn } from '@/core/utils/utils';

const GradientText = ({
	text,
	className,
}: {
	text: string;
	className?: string;
}) => {
	return (
		<span
			className={cn(
				'bg-linear-to-tl from-[#E1DBFF] via-[#B3A5E7] to-[#D5E0FF] bg-clip-text text-transparent',
				className
			)}
		>
			{text}
		</span>
	);
};

export default GradientText;
