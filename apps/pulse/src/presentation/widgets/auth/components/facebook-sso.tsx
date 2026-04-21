import FacebookIcon from '@/presentation/shapes/facebook-icon';
import ClerkSSO from './sso';

const FacebookSSO = () => {
	return (
		<ClerkSSO
			provider="oauth_facebook"
			label="Continue with Facebook"
			icon={<FacebookIcon />}
		/>
	);
};

export default FacebookSSO;
