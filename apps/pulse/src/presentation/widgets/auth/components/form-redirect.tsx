import NextLink from 'next/link';
import { LOGIN, SIGNUP } from '@/core/constants/routes.constrains';

type RedirectProps = {
	label: string;
	actionText: string;
	href: string;
};

const RedirectText = ({ label, actionText, href }: RedirectProps) => {
	return (
		<p className="text-center text-base text-content/70">
			{label}{' '}
			<NextLink
				href={href}
				className="underline underline-offset-2 hover:text-primary"
			>
				{actionText}
			</NextLink>
		</p>
	);
};

const RedirectToLogin = () => {
	return (
		<RedirectText
			label="Already have an account?"
			actionText="Login"
			href={LOGIN}
		/>
	);
};

const RedirectToSignup = () => {
	return (
		<RedirectText
			label="Don't have an account?"
			actionText="Sign up"
			href={SIGNUP}
		/>
	);
};

export { RedirectToLogin, RedirectToSignup };
