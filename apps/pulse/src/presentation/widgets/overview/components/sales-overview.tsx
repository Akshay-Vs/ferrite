import FadeInItem from '@/presentation/animations/fade-in-item';

const SalesOverview = () => {
	return (
		<div className="h-[max(44.48rem,calc(100dvh-22.97rem))] grid grid-rows-[3fr_2fr] gap-4">
			<div className="grid grid-cols-[3fr_1fr] gap-4">
				<FadeInItem>
					<div className="bg-blue-400/10 center rounded-container h-full">
						1
					</div>
				</FadeInItem>

				<FadeInItem>
					<div className="bg-red-400/10 center rounded-container h-full">2</div>
				</FadeInItem>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<FadeInItem>
					<div className="bg-green-400/10 center rounded-container h-full">
						3
					</div>
				</FadeInItem>

				<FadeInItem>
					<div className="bg-yellow-400/10 center rounded-container h-full">
						4
					</div>
				</FadeInItem>
			</div>
		</div>
	);
};

export default SalesOverview;
