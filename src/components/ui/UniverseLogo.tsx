import React from 'react';
import Image from 'next/image';

export const UniverseLogo = ({ className = "h-10 w-auto" }: { className?: string }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <Image
      src="/logo.png"
      alt="Universe Chain Logo"
      width={120}
      height={120}
      className="w-9 h-9 sm:w-10 sm:h-10 object-contain flex-shrink-0"
      priority
    />
    <span className="text-lg sm:text-xl font-bold tracking-tight whitespace-nowrap leading-none">
      <span className="text-slate-800 font-extrabold">Universe</span>{' '}
      <span className="bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent font-black">Chain</span>
    </span>
  </div>
);
