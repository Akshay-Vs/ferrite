import MicrosoftIcon from '@/presentation/shapes/microsoft-icon';
import SSO from './sso';

const MicrosoftSSO = () => {
	return (
		<SSO
			provider="oauth_microsoft"
			label="Continue with Microsoft"
			icon={<MicrosoftIcon />}
		/>
	);
};

export default MicrosoftSSO;
