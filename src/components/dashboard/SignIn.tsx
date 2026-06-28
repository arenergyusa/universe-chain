'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { SiweMessage } from 'siwe';
import { Wallet, ShieldAlert, Loader2, KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const { address, isConnected, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const siweInProgress = useRef(false);

  // If connected, trigger SIWE flow automatically or let user click
  useEffect(() => {
    if (isConnected && address) {
      handleSiwe();
    }
  }, [isConnected, address]);

  const handleConnect = async () => {
    try {
      setError(null);
      await open();
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    }
  };

  const handleSiwe = async () => {
    if (!address || !chainId) return;
    if (siweInProgress.current) return;

    try {
      siweInProgress.current = true;
      setLoading(true);
      setError(null);

      // 1. Get nonce from server
      const nonceRes = await fetch('/api/auth/nonce');
      const { nonce } = await nonceRes.json();

      if (!nonce) {
        throw new Error('Failed to retrieve authentication challenge from server.');
      }

      // Retrieve referrer code from localStorage if exists
      const referrerCode = typeof window !== 'undefined' ? localStorage.getItem('universechain_ref') : null;

      // 2. Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Welcome to Universe Chain. Sign in to securely access your Web3 account dashboard.',
        uri: window.location.origin,
        version: '1',
        chainId: chainId,
        nonce: nonce,
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
        throw new Error(verifyData.error || 'Authentication failed');
      }

      // Clean up ref code if registration succeeded
      if (referrerCode) {
        localStorage.removeItem('universechain_ref');
      }

      // Successful login, refresh page to load dashboard
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Signature request rejected or failed.');
      disconnect(); // Disconnect to allow retry
    } finally {
      setLoading(false);
      siweInProgress.current = false;
    }
  };


  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="relative w-full max-w-md">
        {/* Decorative background glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/20 to-emerald-400/10 rounded-3xl opacity-30 blur-2xl"></div>

        <div className="glass-card relative border border-slate-200/80 rounded-3xl p-8 shadow-xl space-y-8 text-center">
          {/* Brand/Header */}
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-white font-bold shadow-lg shadow-sky-500/20 mx-auto animate-float">
              <KeyRound className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Access Universe Chain
            </h2>
            <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
              Connect your secure Web3 wallet and sign the request to enter your personal account vault.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start space-x-2.5 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-left text-xs">
              <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          {/* Action Button */}
          <div>
            {loading ? (
              <button
                disabled
                className="w-full flex items-center justify-center space-x-2 bg-slate-100 text-slate-400 font-bold py-4 rounded-xl text-sm border border-slate-200 cursor-not-allowed"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating with Wallet...</span>
              </button>
            ) : isConnected ? (
              <button
                onClick={handleSiwe}
                className="glow-btn w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl text-sm shadow-md transition-all"
              >
                <Wallet className="w-4.5 h-4.5" />
                <span>Sign In Challenge</span>
              </button>
            ) : (
              <button
                onClick={handleConnect}
                className="glow-btn w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl text-sm shadow-md transition-all"
              >
                <Wallet className="w-4.5 h-4.5" />
                <span>Connect Wallet</span>
              </button>
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
