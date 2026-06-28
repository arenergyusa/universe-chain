'use client';

import React, { ReactNode } from 'react';
import { wagmiAdapter, projectId } from '@/lib/wagmi';
import { createAppKit } from '@reown/appkit/react';
import { bsc } from '@reown/appkit/networks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';

// 1. Create a QueryClient
const queryClient = new QueryClient();

if (!projectId) {
  console.warn('WalletConnect Project ID is not defined. Web3Modal may not function properly.');
}

// 2. Create the AppKit instance
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [bsc],
  defaultNetwork: bsc,
  metadata: {
    name: 'Universe Chain',
    description: 'Universe Chain Secure Web3 Access Platform',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://universechain.online',
    icons: ['https://avatars.githubusercontent.com/u/179229932'],
  },
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
  themeVariables: {
    '--w3m-font-family': 'var(--font-geist-sans), sans-serif',
  }
});

export function Web3Provider({ children }: { children: ReactNode }) {
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        localStorage.setItem('universechain_ref', ref);
      }
    }
  }, []);

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

