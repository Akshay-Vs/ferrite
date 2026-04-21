const PulseIcon = ({
	strokeWidth = 2,
	size = 58,
	className,
}: {
	strokeWidth?: number;
	size?: number | string;
	className?: string;
}) => {
	return (
		<svg
			width={size}
			height={size}
			className={className}
			viewBox="0 0 87 89"
			fill="none"
			aria-label="Ferrite Pulse Logo"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M16.2514 22.0684L57.8213 56.71"
				stroke="#EEEEEE"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
			/>
			<path
				d="M85.3242 19.9528L1.00024 49.3335"
				stroke="#EEEEEE"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
			/>
			<path
				d="M42.6357 1.00024L23.4773 87.2129"
				stroke="#EEEEEE"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
			/>
			<path
				d="M58.2042 19.1451L2.55427 64.2374"
				stroke="#EEEEEE"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
			/>
		</svg>
	);
};

export default PulseIcon;
