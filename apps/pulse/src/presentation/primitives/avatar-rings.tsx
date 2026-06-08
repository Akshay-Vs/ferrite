import Image from 'next/image';
import { cn } from '@/core/utils/cn';

export interface AvatarRingsProps {
	images: {
		id: string;
		src: string;
	}[];
	max?: number;
	className?: string;
	imageClassName?: string;
}

export const AvatarRings = ({
	images,
	max = 3,
	className,
	imageClassName,
}: AvatarRingsProps) => {
	const visibleImages = images.slice(0, max);
	const remainingCount = images.length - max;

	return (
		<div className={cn('flex items-center', className)}>
			{visibleImages.map((img, index) => {
				const isLast = index === max - 1;
				const showOverlay = isLast && remainingCount > 0;
				return (
					<div
						key={img.id}
						className={cn(
							'relative rounded-full border h-12 w-12 overflow-hidden bg-background shrink-0',
							index === 0 ? 'border-border z-1' : '-ml-8 border-content/60 z-2',
							imageClassName
						)}
					>
						<Image
							src={img.src}
							alt="Avatar"
							width={48}
							height={48}
							className="h-full w-full object-cover object-center"
						/>
						{showOverlay && (
							<div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-sm font-medium">
								+{remainingCount}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
};
