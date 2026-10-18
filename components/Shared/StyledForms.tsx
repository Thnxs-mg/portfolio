
import React from 'react';

export const BlobTopRight: React.FC = () => (
  <div className="hidden md:block fixed -top-20 -right-20 w-80 h-80 bg-[#151621] dark:bg-[#45b7aa]/10 rounded-full opacity-90 dark:opacity-40 blob-animate pointer-events-none z-[-1]">
    <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-[#BDC3C7] dark:bg-[#45b7aa]/20 rounded-full opacity-20"></div>
  </div>
);

export const BlobBottomLeft: React.FC = () => (
  <div className="hidden md:block fixed -bottom-40 -left-20 w-96 h-96 bg-[#151621] dark:bg-[#45b7aa]/10 rounded-full opacity-90 dark:opacity-40 blob-animate pointer-events-none z-[-1]" style={{ animationDelay: '2s' }}>
    <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-[#45b7aa] dark:bg-white/10 rounded-full opacity-30"></div>
  </div>
);

export const CapsuleDivider: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <h2 className={`cinema-section-label ${className}`}>
    <span aria-hidden="true" />{children}
  </h2>
);

export const DecorativeLine: React.FC = () => (
  <div className="w-1 h-32 bg-[#45b7aa] rounded-full absolute -left-10 top-20 hidden lg:block opacity-50"></div>
);

export const MotionWords: React.FC<{ children: string }> = ({ children }) => (
  <>{children.split(' ').map((word, index) => (
    <React.Fragment key={`${index}-${word}`}>
      {index > 0 && ' '}<span className="cinema-word-mask"><span className="cinema-word">{word}</span></span>
    </React.Fragment>
  ))}</>
);
