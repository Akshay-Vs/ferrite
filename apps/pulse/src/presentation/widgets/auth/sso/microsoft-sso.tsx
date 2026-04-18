import ClerkSSO, { GlobalLoading } from './clerk-sso';
import MicrosoftIcon from '@/presentation/shapes/microsoft-icon';

const MicrosoftSSO = ({ isGlobalLoading }: GlobalLoading) => {
  return (
    <ClerkSSO
      isGlobalLoading={isGlobalLoading}
      provider="microsoft"
      label="Continue with Microsoft"
      icon={<MicrosoftIcon />}
    />
  );
};

export default MicrosoftSSO;
