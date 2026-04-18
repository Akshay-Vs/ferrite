import GradientText from '@/presentation/primitives/gradient-text';
import { LoginForm } from '@/presentation/widgets/auth/forms/login-form';

const LoginPage = () => {
	return (
		<div className="flex flex-col items-center gap-16 w-full">
			<div className="col-center gap-4">
				<h1 className="text-4xl font-extralight tracking-[0.012rem]">
					Welcome to{' '}
					<GradientText text="Ferrite Pulse" className="font-light" />
				</h1>
				<p className="text- text-lg font-light">
					Login to your existing account
				</p>
			</div>

			<LoginForm />
		</div>
	);
};

export default LoginPage;
