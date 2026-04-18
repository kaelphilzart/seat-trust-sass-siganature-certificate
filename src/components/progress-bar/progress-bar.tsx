'use client';

import { ProgressProvider } from '@bprogress/next/app';

const ProgressBar = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProgressProvider
      height="4px"
      color="#FF7F11"
      options={{ showSpinner: false }}
      shallowRouting={true}
    >
      {children}
    </ProgressProvider>
  );
};

export default ProgressBar;
