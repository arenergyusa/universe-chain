import { cookieStorage, createStorage, http, fallback } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

// WalletConnect Cloud Project ID — get from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

// Cast as any to prevent strict type conflicts between Wagmi chains and Reown AppKit types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const networks = [bsc] as any;

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId,
  networks,
  transports: {
    [bsc.id]: fallback([
      http(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || 'https://bnb.publicnode.com'),
      http(process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed.binance.org/')
    ]),
  },
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
