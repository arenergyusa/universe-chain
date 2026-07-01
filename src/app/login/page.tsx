'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginRedirectHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Capture referral code from URL and store in localStorage
    const ref = searchParams.get('ref');
    if (ref && typeof window !== 'undefined') {
      localStorage.setItem('universechain_ref', ref);
    }

    // Redirect to dashboard (which will show SignIn if not authenticated)
    router.replace('/dashboard');
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-sky-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-sky-500 animate-spin" />
        </div>
      }
    >
      <LoginRedirectHandler />
    </Suspense>
  );
}
