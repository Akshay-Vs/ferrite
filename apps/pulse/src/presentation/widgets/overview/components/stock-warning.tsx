import { ChevronRight } from 'lucide-react';
import FadeInItem from '@/presentation/animations/fade-in-item';
import { AvatarRings } from '@/presentation/primitives/avatar-rings';

const items = [
	{
		id: '1',
		src: 'https://images.pexels.com/photos/28255124/pexels-photo-28255124.jpeg',
	},
	{
		id: '2',
		src: 'https://images.pexels.com/photos/7795688/pexels-photo-7795688.jpeg',
	},
	{
		id: '3',
		src: 'https://images.pexels.com/photos/7797735/pexels-photo-7797735.jpeg',
	},
	{
		id: '4',
		src: 'https://images.pexels.com/photos/8140898/pexels-photo-8140898.jpeg',
	},
] as const;

const StockWarning = () => {
	return (
		<FadeInItem className="flex center gap-4 rounded-l-full bg-surface/80 border-r-0 border border-gradient translate-x-5 h-14 pl-1 pr-4">
			<AvatarRings
				images={items.map((item) => ({ id: item.id, src: item.src }))}
				max={items.length}
			/>
			<p className="text-lg flex items-center gap-2">
				6 Items running low on stock
				<ChevronRight />
			</p>
		</FadeInItem>
	);
};

export default StockWarning;
