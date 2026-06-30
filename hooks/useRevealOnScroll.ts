import { useEffect, useRef } from 'react';

export function useRevealOnScroll<T extends HTMLElement>() {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !('IntersectionObserver' in window)) return;

    const elements = Array.from(container.querySelectorAll<HTMLElement>('.portfolio-reveal'));
    const replayOffset = 260;
    const replayTimers = new WeakMap<HTMLElement, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;

          if (entry.isIntersecting) {
            const hasRevealed = element.classList.contains('has-revealed');
            const canReplay = element.dataset.revealAway === 'true';

            element.classList.add('is-visible');
            element.classList.add('has-revealed');
            element.dataset.revealAway = 'false';

            if (hasRevealed && canReplay) {
              element.classList.remove('portfolio-replay');
              void element.offsetWidth;
              element.classList.add('portfolio-replay');

              const existingTimer = replayTimers.get(element);
              if (existingTimer) {
                window.clearTimeout(existingTimer);
              }

              const timer = window.setTimeout(() => {
                element.classList.remove('portfolio-replay');
                replayTimers.delete(element);
              }, 520);
              replayTimers.set(element, timer);
            }

            return;
          }

          const hasFullyLeftViewport =
            entry.boundingClientRect.bottom < -replayOffset ||
            entry.boundingClientRect.top > window.innerHeight + replayOffset;

          if (hasFullyLeftViewport) {
            element.dataset.revealAway = 'true';
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -6% 0px',
      }
    );

    elements.forEach((element, index) => {
      element.style.setProperty('--reveal-delay', `${Math.min(index * 80, 360)}ms`);
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
      elements.forEach((element) => {
        const timer = replayTimers.get(element);
        if (timer) {
          window.clearTimeout(timer);
        }
      });
    };
  }, []);

  return containerRef;
}
