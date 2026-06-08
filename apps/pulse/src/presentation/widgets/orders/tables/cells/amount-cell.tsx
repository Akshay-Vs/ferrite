import type { Product } from '../../lib/orders-mock';
import type { OrdersRowProps } from '../../types/orders-row';

export const AmountCell = ({ row }: OrdersRowProps) => {
	const products: Product[] = row.getValue('products');
	const amount = products.map((p) => p.price).reduce((a, b) => a + b, 0);

	return (
		<div className="w-full h-fit center max-w-64">$ {amount.toFixed(2)}</div>
	);
};
