import GoogleIcon from '@/presentation/shapes/google-icon';
import ClerkSSO, { GlobalLoading } from './clerk-sso';

const GoogleSSO = ({ isGlobalLoading }: GlobalLoading) => {
  return (
    <ClerkSSO
      isGlobalLoading={isGlobalLoading}
      provider="google"
      label="Continue with google"
      icon={<GoogleIcon />}
    />
  );
};

export default GoogleSSO;
