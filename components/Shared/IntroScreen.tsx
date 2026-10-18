import React, { useCallback, useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

const INTRO_KEY = 'portfolio:intro-seen';

export const shouldShowIntro = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try { return sessionStorage.getItem(INTRO_KEY) !== '1'; }
  catch { return true; }
};

const IntroScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [leaving, setLeaving] = useState(false);
  const finish = useCallback(() => {
    try { sessionStorage.setItem(INTRO_KEY, '1'); } catch { /* Storage can be unavailable. */ }
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const preferenceChanged = () => { if (reduced.matches) finish(); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') finish(); };
    const reveal = window.setTimeout(() => setLeaving(true), 850);
    // The page must remain reachable even when CSS animations do not fire.
    const fallback = window.setTimeout(finish, 1500);
    reduced.addEventListener('change', preferenceChanged);
    window.addEventListener('keydown', escape);
    return () => {
      clearTimeout(reveal);
      clearTimeout(fallback);
      reduced.removeEventListener('change', preferenceChanged);
      window.removeEventListener('keydown', escape);
    };
  }, [finish]);

  return (
    <section
      className={`jc-intro${leaving ? ' is-leaving' : ''}`}
      aria-label="Introduction — Jason Chris"
      onAnimationEnd={event => { if (leaving && event.target === event.currentTarget) finish(); }}
    >
      <div className="jc-intro-signature">
        <div className="jc-intro-mark" aria-hidden="true">
          <svg className="jc-intro-ring" viewBox="0 0 160 160" fill="none">
            <circle cx="80" cy="80" r="76" pathLength="1" />
          </svg>
          <span className="jc-intro-disc"><span className="jc-intro-letter">J</span><span className="jc-intro-letter">C</span></span>
        </div>
        <p className="jc-intro-name">JASON CHRIS</p>
      </div>
      <button type="button" className="jc-intro-skip" onClick={finish}>
        Passer l’introduction <ArrowUpRight size={14} aria-hidden="true" />
      </button>
    </section>
  );
};

export default IntroScreen;
