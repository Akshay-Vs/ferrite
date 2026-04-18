import FacebookIcon from '@/presentation/shapes/facebook-icon';
import ClerkSSO, { GlobalLoading } from './clerk-sso';

const FacebookSSO = ({ isGlobalLoading }: GlobalLoading) => {
  return (
    <ClerkSSO
      isGlobalLoading={isGlobalLoading}
      provider="facebook"
      label="Continue with Facebook"
      icon={<FacebookIcon />}
    />
  );
};

export default FacebookSSO;
