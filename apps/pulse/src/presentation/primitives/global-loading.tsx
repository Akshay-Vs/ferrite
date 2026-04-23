import { Logo } from './logo';

const GlobalLoading = () => {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
			<div className="flex flex-col gap-4 items-center">
				<Logo size="3xl" strokeWidth={1.25} />

				{/* Utilize pure CSS for visual feedback, replacing JavaScript orchestration */}
				<p className="text-center text-xl font-light text-muted-foreground animate-pulse">
					Loading...
				</p>
			</div>
		</div>
	);
};

export default GlobalLoading;
