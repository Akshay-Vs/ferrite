interface ShipmentDetailsScreenProps {
	params: { orderId: string };
}

const ShipmentDetailsScreen = ({ params }: ShipmentDetailsScreenProps) => {
	return (
		<div className="col gap-4 px-6">
			<p className="text-sm font-mono text-muted-foreground">
				{params.orderId}
			</p>
		</div>
	);
};

export default ShipmentDetailsScreen;
