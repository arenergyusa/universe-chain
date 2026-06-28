'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  label?: string;
}

export default function CopyButton({ text, label = 'Copy Address' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl text-xs font-bold transition-all duration-150 border ${
        copied
          ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm font-extrabold'
          : 'bg-slate-100 hover:bg-slate-200 border-transparent text-slate-700 hover:text-slate-900 shadow-2xs'
      }`}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 text-slate-500" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
