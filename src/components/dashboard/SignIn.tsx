/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { getAddress } from 'viem';
import { SiweMessage } from 'siwe';
import { Wallet, Loader2, KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function SignIn() {
  const { address, isConnected, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const siweInProgress = useRef(false);


  const handleConnect = async () => {
    try {
      await open();
    } catch (err: any) {
      toast.error(err.message || 'Failed to connect wallet');
    }
  };

  const handleSiwe = async () => {
    if (!address || !chainId) return;
    if (siweInProgress.current) return;

    try {
      siweInProgress.current = true;
      setLoading(true);

      // 1. Get nonce from server
      const nonceRes = await fetch('/api/auth/nonce');
      const payload = await nonceRes.json();

      if (!nonceRes.ok || !payload.success) {
        throw new Error(payload.error?.message || 'Failed to retrieve authentication challenge from server.');
      }

      const nonce = payload.data?.nonce;

      if (!nonce) {
        throw new Error('Failed to retrieve authentication challenge from server.');
      }

      // Retrieve referrer code from localStorage if exists
      const referrerCode = typeof window !== 'undefined' ? localStorage.getItem('universechain_ref') : null;

      // 2. Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address: getAddress(address),
        statement: 'Welcome to Universe Chain. Sign in to securely access your Web3 account dashboard.',
        uri: window.location.origin,
        version: '1',
        chainId: chainId,
        nonce: nonce,
        expirationTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // Expires in 5 minutes
      });

      const preparedMessage = message.prepareMessage();

      // 3. Request wallet signature
      const signature = await signMessageAsync({
        message: preparedMessage,
      });

      // 4. Verify signature with server
      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: preparedMessage,
          signature,
          referrerCode,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error?.message || 'Authentication failed');
      }

      // Clean up ref code if registration succeeded
      if (referrerCode) {
        localStorage.removeItem('universechain_ref');
      }

      toast.success('Successfully authenticated!');

      // Successful login, refresh page to load dashboard
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Signature request rejected or failed.');
      disconnect(); // Disconnect to allow retry
    } finally {
      setLoading(false);
      siweInProgress.current = false;
    }
  };

  // If connected, trigger SIWE flow automatically or let user click
  useEffect(() => {
    if (isConnected && address) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleSiwe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);


  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="relative w-full max-w-md">
        <div className="glass-card relative border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm space-y-8 text-center bg-white">
          {/* Brand/Header */}
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Access Universe Chain
            </h2>
            <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
              Connect your secure Web3 wallet and sign the request to enter your personal account vault.
            </p>
          </div>



          {/* Action Button */}
          <div>
            {loading ? (
              <Button
                disabled
                className="w-full h-14 bg-slate-100 text-slate-400 font-bold rounded-xl text-sm border border-slate-200 cursor-not-allowed hover:bg-slate-100"
              >
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>Authenticating with Wallet...</span>
              </Button>
            ) : isConnected ? (
              <Button
                onClick={handleSiwe}
                className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm shadow-md transition-all"
              >
                <Wallet className="w-4.5 h-4.5 mr-2" />
                <span>Sign In Challenge</span>
              </Button>
            ) : (
              <Button
                onClick={handleConnect}
                className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm shadow-md transition-all"
              >
                <Wallet className="w-4.5 h-4.5 mr-2" />
                <span>Connect Wallet</span>
              </Button>
            )}
          </div>

          {/* Security Notice */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              We never collect passwords, private keys, or seed phrases. Your digital security remains entirely under your control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
