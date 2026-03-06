class UserRegisteredEvent {
	constructor(
		public readonly userId: string,
		public readonly email: string,
		public readonly password: string
	) {}
}

export default UserRegisteredEvent;
