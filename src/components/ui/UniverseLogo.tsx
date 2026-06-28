import React from 'react';

export const UniverseLogo = ({ className = "h-10 w-auto" }: { className?: string }) => (
  <svg
    viewBox="0 0 480 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="planetGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#38bdf8" /> {/* sky-400 */}
        <stop offset="100%" stopColor="#4f46e5" /> {/* indigo-600 */}
      </linearGradient>
      <linearGradient id="ringGrad" x1="10" y1="50" x2="90" y2="50" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#818cf8" stopOpacity="1" />
        <stop offset="50%" stopColor="#c084fc" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#818cf8" stopOpacity="1" />
      </linearGradient>
      <linearGradient id="textGrad1" x1="110" y1="0" x2="230" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1e293b" /> {/* slate-800 */}
        <stop offset="100%" stopColor="#0f172a" /> {/* slate-900 */}
      </linearGradient>
      <linearGradient id="textGrad2" x1="220" y1="0" x2="480" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#38bdf8" /> {/* sky-400 */}
        <stop offset="100%" stopColor="#818cf8" /> {/* indigo-400 */}
      </linearGradient>
    </defs>
    
    {/* Icon Group */}
    <g>
      {/* Background Glow / Stars */}
      <circle cx="80" cy="20" r="2" fill="#38bdf8" opacity="0.8" />
      <circle cx="20" cy="80" r="1.5" fill="#c084fc" opacity="0.6" />
      <circle cx="85" cy="75" r="2.5" fill="#38bdf8" opacity="0.7" />
      <circle cx="15" cy="25" r="1.5" fill="#ffffff" opacity="0.5" />
      
      {/* Back part of ring */}
      <path
        d="M12 40 C30 25, 70 25, 88 40"
        stroke="url(#ringGrad)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Planet Body */}
      <circle cx="50" cy="50" r="25" fill="url(#planetGrad)" />
      
      {/* Highlight for depth */}
      <path
        d="M32 32 A25 25 0 0 1 68 68 A25 25 0 0 0 32 32 Z"
        fill="#ffffff"
        opacity="0.15"
      />

      {/* Front part of ring */}
      <path
        d="M12 40 C30 55, 70 55, 88 40"
        stroke="url(#ringGrad)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </g>

    {/* Text Group */}
    <text x="110" y="66" fontFamily="Arial, sans-serif" fontSize="48" fontWeight="bold" letterSpacing="-1">
      <tspan fill="url(#textGrad1)">Universe</tspan>
      <tspan fill="url(#textGrad2)" fontWeight="900">Chain</tspan>
    </text>
  </svg>
);
