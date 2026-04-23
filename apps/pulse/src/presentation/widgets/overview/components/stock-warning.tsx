import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import FadeInItem from '@/presentation/animations/fade-in-item';

const items = [
	{
		id: '1',
		imageSrc:
			'https://images.pexels.com/photos/28255124/pexels-photo-28255124.jpeg',
	},
	{
		id: '2',
		imageSrc:
			'https://images.pexels.com/photos/7795688/pexels-photo-7795688.jpeg',
	},
	{
		id: '3',
		imageSrc:
			'https://images.pexels.com/photos/7797735/pexels-photo-7797735.jpeg',
	},
	{
		id: '4',
		imageSrc:
			'https://images.pexels.com/photos/8140898/pexels-photo-8140898.jpeg',
	},
] as const;

const StockWarning = () => {
	return (
		<FadeInItem className="flex center gap-4 rounded-l-full bg-surface border-r-0 border border-gradient translate-x-6 h-14 pl-1 pr-4">
			<div className="flex items-center">
				{items.map((item, index) => (
					<Image
						key={item.id}
						src={item.imageSrc}
						alt="Stock Warning"
						width={48}
						height={48}
						className={`rounded-full object-center object-cover border h-12 w-12
                ${index === 0 ? 'border-border' : '-ml-8 border-content/60'}
              `}
					/>
				))}
			</div>
			<p className="text-xl tracking-tight flex items-center gap-2">
				6 Items running low on stock
				<ChevronRight />
			</p>
		</FadeInItem>
	);
};

export default StockWarning;
