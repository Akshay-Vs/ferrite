interface UserProfileScreenProps {
	params: { userId: string };
}

/**
 * Temporary placeholder — this screen will move to its own
 * users widget directory in a future iteration.
 */
const UserProfileScreen = ({ params }: UserProfileScreenProps) => {
	return (
		<div className="col gap-4 px-6">
			<p className="text-sm font-mono text-muted-foreground">{params.userId}</p>
		</div>
	);
};

export default UserProfileScreen;
