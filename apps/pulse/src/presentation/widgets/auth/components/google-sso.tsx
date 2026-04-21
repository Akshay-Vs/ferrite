import GoogleIcon from '@/presentation/shapes/google-icon';
import SSO from './sso';

const GoogleSSO = () => {
	return (
		<SSO
			provider="oauth_google"
			label="Continue with google"
			icon={<GoogleIcon />}
		/>
	);
};

export default GoogleSSO;
