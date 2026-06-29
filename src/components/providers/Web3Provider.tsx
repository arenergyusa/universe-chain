'use client';

import React, { ReactNode } from 'react';
import { wagmiAdapter, projectId } from '@/lib/wagmi';
import { createAppKit } from '@reown/appkit/react';
import { bsc } from '@reown/appkit/networks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, useAccount, useSwitchChain } from 'wagmi';
import { useRouter, usePathname } from 'next/navigation';

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



function SessionManager() {
  const { isConnected, isDisconnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const router = useRouter();
  const pathname = usePathname();
  const wasConnected = React.useRef(false);

  // Track previous connection state to detect a real transition
  React.useEffect(() => {
    if (isConnected) {
      wasConnected.current = true;
    }
  }, [isConnected]);

  // Force switch to BSC network if connected to a different network
  React.useEffect(() => {
    if (isConnected && chainId !== bsc.id && switchChain) {
      switchChain({ chainId: bsc.id as any });
    }
  }, [isConnected, chainId, switchChain]);

  // Auto logout if wallet transitions to disconnected while in dashboard
  React.useEffect(() => {
    const isDashboard = pathname === '/dashboard' || pathname?.startsWith('/dashboard/');
    
    if (isDisconnected && wasConnected.current && isDashboard) {
      const handleLogout = async () => {
        try {
          const res = await fetch('/api/auth/logout', { method: 'POST' });
          if (res.ok) {
            wasConnected.current = false;
            router.push('/');
            router.refresh();
          } else {
            console.error('Auto-logout API failed with status:', res.status);
          }
        } catch (err) {
          console.error('Auto-logout request failed:', err);
        }
      };
      handleLogout();
    }
  }, [isDisconnected, pathname, router]);

  return null;
}

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
        <SessionManager />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

