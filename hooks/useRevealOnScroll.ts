import { useEffect, useRef } from 'react';

export function useRevealOnScroll<T extends HTMLElement>() {
  const containerRef = useRef<T | null>(null);
  const seen = useRef(new WeakSet<Element>());

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window.IntersectionObserver !== 'function') return;
    const easing = getComputedStyle(container).getPropertyValue('--cinema-ease').trim() || 'ease-out';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Set<Animation>();
    const observed = new WeakSet<Element>();
    const play = (element: Element, frames: Keyframe[], duration: number, delay = 0) => {
      if (reduced.matches || !element.animate) return;
      const animation = element.animate(frames, { duration, delay, easing, fill: 'backwards' });
      animations.add(animation);
      animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
    };
    const reveal = (element: HTMLElement, index: number) => {
      const delay = Math.min(index * 70, 210);
      const words = element.querySelectorAll('.cinema-word');
      if (words.length) {
        words.forEach((word, i) => play(word, [
          { transform: 'translateY(100%)', opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 },
        ], 650, Math.min(i * 60, 240)));
      } else if (element.classList.contains('cinema-project-entry')) {
        const image = element.firstElementChild;
        const info = element.querySelector('.cinema-project-info');
        const infoTargets = Array.from(info?.children ?? []).flatMap(child =>
          child.classList.contains('cinema-project-technologies') ? Array.from(child.children) : [child]);
        const targets = [image, ...infoTargets, element.lastElementChild];
        targets.forEach((target, i) => {
          if (target) play(target, [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], 550, Math.min(i * 60, 240));
        });
      } else {
        play(element, [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], 600, delay);
      }
      element.querySelectorAll('[role="progressbar"]').forEach((bar, i) => {
        play(bar, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 650, Math.min(i * 70, 210));
      });
      if (element.classList.contains('cinema-section-label') && element.firstElementChild) {
        play(element.firstElementChild, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 650, delay);
      }
    };
    const observer = new IntersectionObserver(entries => {
      entries.filter(entry => entry.isIntersecting).forEach((entry, index) => {
        const element = entry.target as HTMLElement;
        if (!seen.current.has(element)) {
          seen.current.add(element);
          element.dataset.motionRevealed = 'true';
          reveal(element, index);
        }
        observer.unobserve(element);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
    const observe = () => {
      container.querySelectorAll('.portfolio-reveal').forEach(element => {
        if (!observed.has(element) && !seen.current.has(element)) {
          observed.add(element);
          observer.observe(element);
        }
      });
    };
    observe();
    // Filtered project results can introduce new elements without remounting the page.
    const mutations = new MutationObserver(observe);
    mutations.observe(container, { childList: true, subtree: true });
    const cancel = () => animations.forEach(animation => animation.cancel());
    const preferenceChanged = () => { if (reduced.matches) cancel(); };
    reduced.addEventListener('change', preferenceChanged);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      reduced.removeEventListener('change', preferenceChanged);
      cancel();
    };
  }, []);

  return containerRef;
}
