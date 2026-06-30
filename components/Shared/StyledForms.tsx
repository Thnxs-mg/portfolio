
import React from 'react';

export const BlobTopRight: React.FC = () => (
  <div className="hidden md:block fixed -top-20 -right-20 w-80 h-80 bg-[#151621] dark:bg-[#b8b2b0]/10 rounded-full opacity-90 dark:opacity-40 blob-animate pointer-events-none z-[-1]">
    <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-[#BDC3C7] dark:bg-[#b8b2b0]/20 rounded-full opacity-20"></div>
  </div>
);

export const BlobBottomLeft: React.FC = () => (
  <div className="hidden md:block fixed -bottom-40 -left-20 w-96 h-96 bg-[#151621] dark:bg-[#b8b2b0]/10 rounded-full opacity-90 dark:opacity-40 blob-animate pointer-events-none z-[-1]" style={{ animationDelay: '2s' }}>
    <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-[#b8b2b0] dark:bg-white/10 rounded-full opacity-30"></div>
  </div>
);

export const CapsuleDivider: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <div className={`brand-font relative h-10 overflow-hidden rounded-full bg-[#151621] px-8 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-[#151621]/10 dark:bg-[#b8b2b0] ${className}`}>
    <span className="absolute inset-y-0 left-0 w-10 bg-white/15 blur-xl" />
    <span className="relative flex h-full items-center justify-center">{children}</span>
  </div>
);

export const DecorativeLine: React.FC = () => (
  <div className="w-1 h-32 bg-[#b8b2b0] rounded-full absolute -left-10 top-20 hidden lg:block opacity-50"></div>
);
