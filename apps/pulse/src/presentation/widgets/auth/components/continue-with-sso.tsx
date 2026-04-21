'use client';

import FacebookSSO from './facebook-sso';
import GoogleSSO from './google-sso';
import MicrosoftSSO from './microsoft-sso';

const ContinueWithSSO = () => {
	return (
		<div className="col-center gap-6 text-center">
			<p>Or continue with</p>
			<div className="flex gap-12 center full">
				<GoogleSSO />
				<FacebookSSO />
				<MicrosoftSSO />
			</div>
		</div>
	);
};

export default ContinueWithSSO;
