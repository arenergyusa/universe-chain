'use client';

import { useEffect } from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, this would send to a monitoring service like Sentry
    console.error('Global Error caught:', {
      message: error.message,
      digest: error.digest
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="glass-card bg-white border border-rose-200/60 rounded-3xl p-8 max-w-lg w-full text-center shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Application Error
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Something went wrong while processing your request. Please try again or return home.
          </p>
        </div>


        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center pt-2">
          <Button 
            onClick={() => reset()}
            variant="default"
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button 
              variant="outline"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
