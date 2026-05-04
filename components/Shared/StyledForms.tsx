
import React from 'react';

export const BlobTopRight: React.FC = () => (
  <div className="fixed -top-20 -right-20 w-80 h-80 bg-[#2D3243] dark:bg-[#52B2BF]/10 rounded-full opacity-90 dark:opacity-40 blob-animate pointer-events-none z-[-1]">
    <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-[#BDC3C7] dark:bg-[#52B2BF]/20 rounded-full opacity-20"></div>
  </div>
);

export const BlobBottomLeft: React.FC = () => (
  <div className="fixed -bottom-40 -left-20 w-96 h-96 bg-[#2D3243] dark:bg-[#52B2BF]/10 rounded-full opacity-90 dark:opacity-40 blob-animate pointer-events-none z-[-1]" style={{ animationDelay: '2s' }}>
    <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-[#52B2BF] dark:bg-white/10 rounded-full opacity-30"></div>
  </div>
);

export const CapsuleDivider: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <div className={`h-10 bg-[#2D3243] dark:bg-[#52B2BF] rounded-full flex items-center justify-center text-white font-bold uppercase tracking-widest text-sm px-8 shadow-lg ${className}`}>
    {children}
  </div>
);

export const DecorativeLine: React.FC = () => (
  <div className="w-1 h-32 bg-[#52B2BF] rounded-full absolute -left-10 top-20 hidden lg:block opacity-50"></div>
);
