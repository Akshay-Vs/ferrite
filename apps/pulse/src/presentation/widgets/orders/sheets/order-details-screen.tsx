import OrderItems from '../components/order-items';
import PaymentDetails from '../components/payment-details';
import ShipmentDetails from '../components/shipment-details';

interface OrderDetailsScreenProps {
	params: { orderId: string };
}

const OrderDetailsScreen = ({ params }: OrderDetailsScreenProps) => {
	return (
		<div className="col gap-5 px-6">
			<p className="text-sm font-mono text-muted-foreground">
				{params.orderId}
			</p>

			<div className="col gap-10">
				<OrderItems />
				<ShipmentDetails />
				<PaymentDetails />
			</div>
		</div>
	);
};

export default OrderDetailsScreen;
