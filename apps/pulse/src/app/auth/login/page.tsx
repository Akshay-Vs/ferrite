import FormHeading from '@/presentation/primitives/form-heading';
import { LoginForm } from '@/presentation/widgets/auth/forms/login-form';

const LoginPage = () => {
	return (
		<div className="flex flex-col items-center gap-16 w-full">
			<FormHeading
				title="Welcome to"
				highlightedText="Ferrite Pulse"
				description="Login to your existing account"
			/>
			<LoginForm />
		</div>
	);
};

export default LoginPage;
