import GradientText from '@/presentation/primitives/gradient-text';
import { SignupForm } from '@/presentation/widgets/auth/forms/signup-form';

const SignupPage = () => {
	return (
		<div className="flex flex-col items-center gap-16 w-full">
			<div className="col-center gap-4">
				<h1 className="text-4xl font-extralight tracking-[0.012rem]">
					Welcome to{' '}
					<GradientText text="Ferrite Pulse" className="font-light" />
				</h1>
				<p className="text- text-lg font-light">Create a new account</p>
			</div>

			<SignupForm />
		</div>
	);
};

export default SignupPage;
