import FadeInItem from '@/presentation/animations/fade-in-item';

const ordersPage = () => {
	return (
		<FadeInItem className="min-h-0 min-w-0">
			<div className="relative min-h-[200vh] rounded-container border border-border border-t-transparent bg-card">
				<div className="sticky top-24">
					<div className="absolute top-0 left-1/2 h-8 w-[99vw] -translate-x-1/2 bg-transparent-to-background -z-10" />

					<div className="center rounded-t-container h-24 border-t border-border bg-card border-gradient">
						Main Chart
					</div>
				</div>
			</div>{' '}
		</FadeInItem>
	);
};

export default ordersPage;
