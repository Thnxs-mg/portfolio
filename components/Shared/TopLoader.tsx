import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export const TopLoader: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Commence à 15% instantanément
    setProgress(15);
    
    // Aléatoirement avance la barre de progression
    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; // Bloque à 90% en attendant la fin
        return prev + Math.random() * 10;
      });
    }, 200);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  // Utilisation d'un portail pour s'assurer que la barre s'affiche au-dessus de tout,
  // même si le composant parent a opacity: 0 pendant les transitions.
  return createPortal(
    <div className="fixed top-0 left-0 w-full h-[3px] z-[99999] pointer-events-none">
      <div 
        className="h-full bg-gradient-to-r from-[#151621] to-[#b8b2b0] dark:from-white dark:to-[#b8b2b0] shadow-[0_0_10px_rgba(184,178,176,0.8)] transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      >
        <div className="absolute top-0 right-0 h-full w-[100px] shadow-[0_0_10px_#b8b2b0,0_0_5px_#b8b2b0] opacity-100 rotate-3 translate-x-1 translate-y-[-2px]"></div>
      </div>
    </div>,
    document.body
  );
};
