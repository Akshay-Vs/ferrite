import FormHeading from '@/presentation/primitives/form-heading';
import { SignupForm } from '@/presentation/widgets/auth/forms/signup-form';

const SignupPage = () => {
	return (
		<div className="flex flex-col items-center gap-16 w-full">
			<FormHeading
				title="Welcome to"
				highlightedText="Ferrite Pulse"
				description="Create a new account"
			/>
			<SignupForm />
		</div>
	);
};

export default SignupPage;
