import React from 'react';

export default function SakBadge({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = {
    sm: 'h-6 w-6 text-[8px]',
    md: 'h-10 w-10 text-[12px]',
    lg: 'h-16 w-16 text-[18px]',
  }[size];

  return (
    <div
      className={`relative ${dims} rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-sky-700 flex items-center justify-center shadow-[0_0_30px_rgba(14,165,233,0.3)] border border-white/20`}
    >
      <div className="absolute inset-0 rounded-2xl bg-sky-400/20 blur-md scale-110 opacity-50 group-hover:opacity-100 transition-opacity" />
      <span className="relative z-10 font-heading font-black text-white tracking-tighter uppercase">
        S<span className="text-sky-200">A</span>K
      </span>
    </div>
  );
}
