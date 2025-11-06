import React from 'react';

export const Logo: React.FC = () => (
  <div className="flex items-center gap-3" aria-label="Kgothatso Shrinkage Control">
    {/* Abstract eagle icon with a white body and red head */}
    <svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M5 35 C 15 20 25 15 35 5 L 5 5 Z" fill="white"/>
      <path d="M35 5 C 40 15 40 25 35 35 L 35 5 Z" fill="#e53e3e"/>
    </svg>
    <div className="flex flex-col">
      <span className="text-2xl font-black tracking-tighter leading-none">
        <span className="text-white">Kgothats</span><span className="text-brand-red">o</span>
      </span>
      <span className="text-xs font-semibold text-brand-red tracking-wide leading-none mt-1">
        SHRINKAGE CONTROL
      </span>
    </div>
  </div>
);


export const IconBolt = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

export const IconChartBar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

export const IconShieldCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);