import Image from 'next/image';
import { AvatarRings } from '@/presentation/primitives/avatar-rings';
import CellActionButton from '../../components/cell-action-button';
import type { Product } from '../../lib/orders-mock';
import { openOrderSheet } from '../../stores/order-sheet-store';
import type { OrdersRowProps } from '../../types/orders-row';

const ProductsCell = ({ row }: OrdersRowProps) => {
	const products: Product[] = row.getValue('products');
	const isExpanded = row.getIsExpanded();

	if (isExpanded) {
		return (
			<div className="w-full h-fit center">
				<div className="flex flex-col gap-3 py-1 w-65">
					{products.map((p) => (
						<div key={p.id} className="flex gap-3 items-center">
							<Image
								src={p.image}
								alt={p.name}
								width={40}
								height={40}
								className="h-10 w-10 shrink-0 rounded-full object-cover border"
							/>
							<CellActionButton
								className="font-medium whitespace-normal text-start w-full"
								value={p.name}
								action={() =>
									openOrderSheet({
										activeSheet: 'product-details',
										productId: p.id,
									})
								}
							/>
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="w-full h-fit center">
			<div className="flex items-center justify-center gap-12 w-65">
				<p className="truncate flex-1 text-start min-w-0">
					{products[0]?.name}
				</p>

				<AvatarRings
					images={products.map((p) => ({ id: p.id, src: p.image }))}
					max={3}
					className="shrink-0 items-start justify-start"
					imageClassName="h-8 w-8 -ml-5"
				/>
			</div>
		</div>
	);
};

export default ProductsCell;
