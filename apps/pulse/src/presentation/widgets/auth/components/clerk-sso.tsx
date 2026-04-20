'use client';

import { Button } from '@base-ui/react/button';
import { Connection, Loading } from '@clerk/elements/common';
import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

export interface GlobalLoading {
  isGlobalLoading: boolean;
}

interface SSOProps extends GlobalLoading {
  provider: 'google' | 'facebook' | 'microsoft';
  label: string;
  icon: ReactNode;
}

const ClerkSSO: React.FC<SSOProps> = ({
  provider,
  label,
  icon,
  isGlobalLoading,
}) => {
  return (
    <Connection name={provider} asChild>
      <Button
        className="h-14 w-14 bg-surface rounded-full center p-2"
        disabled={isGlobalLoading}
        aria-label={label}
      >
        <Loading scope={`provider:${provider}`}>
          {
            (isLoading) => (isLoading ?
              <Loader2 className='animate-spin' />
              :
              <div className='scale-75'>{icon}</div>
            )}
        </Loading>

      </Button>
    </Connection>
  );
};

export default ClerkSSO;
