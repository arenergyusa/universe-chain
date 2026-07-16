'use client';

import { useEffect } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, detailed diagnostics (including error.message) would be sent to a monitoring service like Sentry.
    // We only log the safe digest to the browser console to avoid leaking sensitive information.
    console.error('Dashboard Error caught:', { 
      digest: error.digest 
    });
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center py-20 px-4">
      <div className="glass-card bg-white border border-rose-200/60 rounded-3xl p-8 max-w-lg w-full text-center shadow-sm space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Component Error
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            We encountered an issue loading this section of the dashboard.
          </p>
        </div>


        <div className="pt-2">
          <Button 
            onClick={() => reset()}
            variant="default"
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Component
          </Button>
        </div>
      </div>
    </div>
  );
}
