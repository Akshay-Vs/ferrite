import type { PropsWithChildren } from 'react';
import FadeInItem from '@/presentation/animations/fade-in-item';
import OrdersKPI from '@/presentation/widgets/orders/components/orders-kpi';

const layout = ({ children }: PropsWithChildren) => {
	return (
		<FadeInItem className="full col gap-6">
			<div className="w-full flex items-end justify-end px-2 pb-4">
				<OrdersKPI />
			</div>

			{children}
		</FadeInItem>
	);
};

export default layout;
