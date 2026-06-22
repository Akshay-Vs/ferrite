interface ProductDetailsScreenProps {
	params: { productId: string };
}

const ProductDetailsScreen = ({ params }: ProductDetailsScreenProps) => {
	return (
		<div className="col gap-4 px-6">
			<p className="text-sm font-mono text-muted-foreground">
				{params.productId}
			</p>
		</div>
	);
};

export default ProductDetailsScreen;
