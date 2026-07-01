'use client';

import Link from 'next/link';
import { ShieldX, ArrowLeft, Mail } from 'lucide-react';

export default function BlockedPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="relative w-full max-w-md text-center space-y-8">
        {/* Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-400/10 to-orange-400/10 rounded-3xl opacity-40 blur-2xl" />

        <div className="relative bg-white border border-rose-100 rounded-3xl p-8 shadow-xl space-y-6">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto">
            <ShieldX className="w-8 h-8 text-rose-500" />
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Account Suspended
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
              Your account has been temporarily suspended. Please contact our support team for assistance.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <a
              href="mailto:support@universechain.online"
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-sm transition-all"
            >
              <Mail className="w-4 h-4" />
              Contact Support
            </a>
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl text-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
