export const Slash = ({ gap = 10 }: { gap: number }) => {
	return (
		<svg
			width="100%"
			height="100%"
			xmlns="http://www.w3.org/2000/svg"
			role="presentation"
		>
			<defs>
				<pattern
					id="navPattern"
					width={gap}
					height="100%"
					patternUnits="userSpaceOnUse"
				>
					<svg
						role="presentation"
						viewBox="0 0 25 29"
						width={gap}
						height="100%"
						preserveAspectRatio="none"
					>
						<line
							x1="24.3796"
							y1="0.325396"
							x2="0.379629"
							y2="28.3254"
							stroke="#504f59e3"
							strokeWidth="1.15"
						/>
					</svg>
				</pattern>
			</defs>
			<rect width="100%" height="100%" fill="url(#navPattern)" />
		</svg>
	);
};
