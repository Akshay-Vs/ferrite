import { ChevronRightIcon } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/presentation/primitives/card';

const MOCK_PRODUCTS: Array<{
	id: string;
	name: string;
	price: number;
	sku: string;
	image: string;
	itemsSold: number;
	itemsInStock: number;
	itemRunway: string;
}> = [
	{
		id: '1',
		name: 'Velvet Vault',
		price: 12.99,
		sku: '18A9',
		image: 'https://images.pexels.com/photos/7797527/pexels-photo-7797527.jpeg',
		itemsSold: 10,
		itemsInStock: 100,
		itemRunway: '10d',
	},
	{
		id: '2',
		name: 'Evergreen Edibles',
		price: 9.99,
		sku: '1D0A',
		image: 'https://images.pexels.com/photos/8140898/pexels-photo-8140898.jpeg',
		itemsSold: 10,
		itemsInStock: 100,
		itemRunway: '10d',
	},
	{
		id: '3',
		name: 'Circuit Cityscape',
		price: 9.99,
		sku: '12CE',
		image: 'https://images.pexels.com/photos/7795688/pexels-photo-7795688.jpeg',
		itemsSold: 10,
		itemsInStock: 100,
		itemRunway: '10d',
	},
	{
		id: '4',
		name: 'Urban Umbrella',
		price: 9.99,
		sku: '3F56',
		image: 'https://images.pexels.com/photos/7795846/pexels-photo-7795846.jpeg',
		itemsSold: 10,
		itemsInStock: 100,
		itemRunway: '10d',
	},
	{
		id: '5',
		name: 'Midnight Muse',
		price: 9.99,
		sku: '5AA8',
		image:
			'https://images.pexels.com/photos/36833967/pexels-photo-36833967.jpeg',
		itemsSold: 10,
		itemsInStock: 100,
		itemRunway: '10d',
	},
	{
		id: '6',
		name: 'Petal & Parchment',
		price: 9.99,
		sku: 'F2D4',
		image:
			'https://images.pexels.com/photos/10825663/pexels-photo-10825663.jpeg',
		itemsSold: 10,
		itemsInStock: 100,
		itemRunway: '10d',
	},
];

const TopSellingProducts = () => {
	return (
		<Card className="h-full bg-surface/40 border-gradient flex flex-col overflow-hidden py-4 gap-5">
			<CardHeader className="flex-none flex justify-between items-center">
				<h2 className="px-1 text-base">Top Selling Products</h2>
				<ChevronRightIcon className="h-5 w-5" />
			</CardHeader>

			<CardContent className="flex-1 overflow-y-auto scrollbar-hide col gap-3">
				{MOCK_PRODUCTS.map((product) => (
					<div
						key={product.id}
						className="border-2 border-border h-28 shrink-0 rounded-3xl flex gap-4"
					>
						<Image
							src={product.image}
							alt={product.name}
							width={100}
							height={100}
							loading="eager"
							className="object-cover h-full aspect-square rounded-3xl"
						/>

						<div className="py-3 w-full col gap-1">
							<h3 className="text-lg">{product.name}</h3>
							<div className="flex items-center gap-1">
								<p className="text-base text-amber-100/80">
									$ {product.price.toFixed(2)}
								</p>
							</div>

							<p className="text-base text-content/80">
								{product.itemsSold} items sold
							</p>
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
};

export default TopSellingProducts;
