interface PaymentDetailsScreenProps {
	params: { transactionId: string };
}

const PaymentDetailsScreen = ({ params }: PaymentDetailsScreenProps) => {
	return (
		<div className="col gap-4 px-6">
			<p className="text-sm font-mono text-muted-foreground">
				{params.transactionId}
			</p>
		</div>
	);
};

export default PaymentDetailsScreen;
