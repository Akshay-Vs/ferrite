import OrderItems from '../components/order-items';
import PaymentDetails from '../components/payment-details';
import ShipmentDetails from '../components/shipment-details';

interface OrderDetailsScreenProps {
	params: { orderId: string };
}

const OrderDetailsScreen = ({ params }: OrderDetailsScreenProps) => {
	return (
		<div className="col gap-5  h-full relative">
			<p className="text-sm font-mono text-muted-foreground px-6">
				{params.orderId}
			</p>

			<div className="col gap-10 h-full px-6">
				<OrderItems />
				<ShipmentDetails />
				<PaymentDetails />
			</div>
		</div>
	);
};

export default OrderDetailsScreen;
