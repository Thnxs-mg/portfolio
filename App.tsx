import { flushSync } from 'react-dom';
import { useReducedMotion } from 'framer-motion';
import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, Suspense, memo } from 'react';
import { BrowserRouter as Router, useLocation, Link } from 'react-router-dom';

import Navbar from './components/Layout/Navbar';
import IntroScreen, { shouldShowIntro } from './components/Shared/IntroScreen';
import { jumpToElementWithoutAnimation, jumpToTopWithoutAnimation, consumePendingScrollTarget } from './utils/scrollMotion';
import { Language } from './types';
import { TopLoader } from './components/Shared/TopLoader';

// ─── Import factories ─────────────────────────────────────────────────────────
const importHomePage = () => import('./components/Sections/HomePage');
const importProjectsPage = () => import('./components/Sections/AllProject');

const HomePage = React.lazy(importHomePage);
const AllProjectsPage = React.lazy(importProjectsPage);

const MemoizedHomePage = memo(HomePage);
const MemoizedAllProjectsPage = memo(AllProjectsPage);

// ─── Chunk cache ──────────────────────────────────────────────────────────────
const chunkCache: Record<string, Promise<unknown>> = {};

const warmChunk = (key: string, factory: () => Promise<unknown>) => {
  if (!chunkCache[key]) {
    chunkCache[key] = factory();
  }
  return chunkCache[key];
};

if (typeof window !== 'undefined') {
  // Preload chunks for faster transitions
  warmChunk('projects', importProjectsPage);
  warmChunk('home', importHomePage);
}
const prefetchProjects = () => warmChunk('projects', importProjectsPage);

// ─── NotFoundPage ─────────────────────────────────────────────────────────────
const NotFoundPage: React.FC<{ language: Language }> = ({ language }) => (
  <section className="min-h-[70vh] px-4 sm:px-6 pt-28 pb-20 flex items-center justify-center">
    <div className="max-w-2xl mx-auto text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#151621] dark:bg-white text-white dark:text-[#151621] font-black text-3xl shadow-xl mb-8">
        404
      </div>
      <h1 className="text-3xl sm:text-5xl font-black text-[#151621] dark:text-white tracking-tight mb-4">
        {language === 'fr' ? 'Page introuvable' : 'Page not found'}
      </h1>
      <p className="text-slate-600 dark:text-gray-400 text-base sm:text-lg leading-relaxed mb-8">
        {language === 'fr'
          ? "L'adresse saisie ne correspond à aucune page du portfolio."
          : "The address you entered does not match any portfolio page."}
      </p>
      <Link
        to="/"
        className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-[#151621] dark:bg-white text-white dark:text-[#151621] hover:bg-[var(--cinema-accent)] hover:text-[var(--cinema-on-accent)] dark:hover:bg-[var(--cinema-accent)] dark:hover:text-[var(--cinema-on-accent)] transition-all duration-300 font-black uppercase tracking-widest text-sm shadow-xl"
      >
        {language === 'fr' ? "Retourner à la page d'accueil" : 'Back to home'}
      </Link>
    </div>
  </section>
);

// ─── Retained views, one visible page and one cancellable transition ────────────
const SoftViews: React.FC<{ language: Language; pageRef: React.RefObject<HTMLDivElement | null> }> = ({ language, pageRef }) => {
  const { pathname } = useLocation();
  const reduced = useReducedMotion();
  const [displayedPath, setDisplayedPath] = useState(pathname);
  const displayedPathRef = useRef(pathname);
  const requestedPath = useRef(pathname);
  const sectionTarget = useRef<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useLayoutEffect(() => {
    const host = pageRef.current;
    if (!host) return;
    if (requestedPath.current !== pathname) {
      requestedPath.current = pathname;
      sectionTarget.current = consumePendingScrollTarget();
    }
    setIsDownloading(false);
    if (displayedPathRef.current === pathname && !host.style.opacity && !sectionTarget.current) return;

    let cancelled = false;
    let animation: Animation | null = null;
    let loaderTimer: number | undefined;
    const easing = getComputedStyle(host).getPropertyValue('--cinema-ease').trim();
    host.dataset.transitioning = 'leaving';
    host.setAttribute('aria-busy', 'true');

    const play = async (frames: Keyframe[], duration: number) => {
      if (reduced || !host.animate) return;
      animation = host.animate(frames, { duration, easing, fill: 'forwards' });
      try { await animation.finished; } catch { /* A newer navigation can cancel this one. */ }
    };
    const changePage = async () => {
      let swapped = false;
      if (displayedPathRef.current !== pathname || sectionTarget.current) {
        const load = pathname === '/' ? warmChunk('home', importHomePage)
          : pathname === '/realisations' ? warmChunk('projects', importProjectsPage) : Promise.resolve();
        loaderTimer = window.setTimeout(() => { if (!cancelled) setIsDownloading(true); }, 120);
        await load;
        if (cancelled) return;
        clearTimeout(loaderTimer);
        setIsDownloading(false);
        const current = getComputedStyle(host);
        await play([{ opacity: current.opacity, transform: current.transform }, { opacity: 0, transform: 'translateY(-8px)' }], 120);
        if (cancelled) return;
        // Swap and position the destination while the entire page, including its footer, is covered.
        host.style.opacity = '0';
        animation?.cancel();
        animation = null;
        flushSync(() => setDisplayedPath(pathname));
        displayedPathRef.current = pathname;
        swapped = true;
        if (pathname === '/' && sectionTarget.current) {
          jumpToElementWithoutAnimation(sectionTarget.current, -80);
        } else {
          jumpToTopWithoutAnimation();
        }
        sectionTarget.current = null;
        if (host.contains(document.activeElement)) document.getElementById('main-content')?.focus({ preventScroll: true });
      }
      if (cancelled) return;
      host.dataset.transitioning = 'entering';
      const current = getComputedStyle(host);
      await play([{ opacity: current.opacity, transform: swapped ? 'translateY(12px)' : current.transform }, { opacity: 1, transform: 'none' }], 260);
      if (cancelled) return;
      animation?.cancel();
      animation = null;
      host.style.removeProperty('opacity');
      host.style.removeProperty('transform');
      delete host.dataset.transitioning;
      host.removeAttribute('aria-busy');
    };
    void changePage();
    return () => {
      cancelled = true;
      clearTimeout(loaderTimer);
      if (animation) {
        const current = getComputedStyle(host);
        host.style.opacity = current.opacity;
        host.style.transform = current.transform;
        animation.cancel();
      }
      delete host.dataset.transitioning;
      host.removeAttribute('aria-busy');
    };
  }, [pathname, reduced, pageRef]);

  const homeVisible = displayedPath === '/';
  const projectsVisible = displayedPath === '/realisations';
  return (
    <div data-displayed-page={displayedPath}>
      {isDownloading && <TopLoader />}
      <div style={{ display: homeVisible ? undefined : 'none' }} aria-hidden={!homeVisible} inert={!homeVisible}>
        <Suspense fallback={homeVisible ? <TopLoader /> : null}>
          <MemoizedHomePage language={language} isActive={homeVisible} />
        </Suspense>
      </div>
      <div style={{ display: projectsVisible ? undefined : 'none' }} aria-hidden={!projectsVisible} inert={!projectsVisible}>
        <Suspense fallback={projectsVisible ? <TopLoader /> : null}>
          <MemoizedAllProjectsPage language={language} isActive={projectsVisible} />
        </Suspense>
      </div>
      {!homeVisible && !projectsVisible && <NotFoundPage language={language} />}
    </div>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const [showIntro, setShowIntro] = useState(shouldShowIntro);
  const finishIntro = useCallback(() => setShowIntro(false), []);
  const [language, setLanguage] = useState<Language>('fr');
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = window.localStorage.getItem('theme');
      if (stored === 'dark') return true;
      if (stored === 'light') return false;
    } catch { /* noop */ }
    return true;
  });

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  try { window.localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch { /* noop */ }
  }, [isDark]);

  useEffect(() => { document.documentElement.lang = language; }, [language]);

  const toggleTheme = useCallback(() => setIsDark((d) => !d), []);

  if (showIntro) return <IntroScreen onComplete={finishIntro} />;

  return (
    <Router basename={['/', './'].includes(import.meta.env.BASE_URL) ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <div className="cinema min-h-screen relative selection:bg-[#45b7aa] selection:text-[#151621] transition-colors duration-300">
        <a className="cinema-skip-link" href="#main-content">{language === 'fr' ? 'Aller au contenu' : 'Skip to content'}</a>

        <Navbar
          language={language}
          setLanguage={setLanguage}
          isDark={isDark}
          toggleTheme={toggleTheme}
          prefetchProjects={prefetchProjects}
        />

        <div ref={pageRef} className="cinema-page">
        <main id="main-content" tabIndex={-1} className="cinema-content">
          <SoftViews
            language={language}
            pageRef={pageRef}
          />
        </main>

        <footer className="cinema-footer">
          <div className="cinema-footer-inner">
            <p className="cinema-footer-name">RANDRIAMAHERY JASON CHRIS</p>
            <p className="cinema-eyebrow">
              {language === 'fr' ? 'DÉVELOPPEUR FULL-STACK' : 'FULL-STACK DEVELOPER'}
            </p>
          </div>
        </footer>
        </div>
      </div>
    </Router>
  );
};

export default App;
