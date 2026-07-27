import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, Suspense, memo } from 'react';
import { BrowserRouter as Router, useLocation, useNavigate, Link } from 'react-router-dom';

import Navbar from './components/Layout/Navbar';
import { BlobTopRight, BlobBottomLeft } from './components/Shared/StyledForms';
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
const prefetchProjects = () => importProjectsPage();

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
        className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-[#151621] dark:bg-white text-white dark:text-[#151621] hover:bg-[#b8b2b0] dark:hover:bg-[#b8b2b0] dark:hover:text-white transition-all duration-300 font-black uppercase tracking-widest text-sm shadow-xl"
      >
        {language === 'fr' ? "Retourner à la page d'accueil" : 'Back to home'}
      </Link>
    </div>
  </section>
);

// ─── revealSoftViewElements ───────────────────────────────────────────────────
const revealSoftViewElements = (view: HTMLElement | null) => {
  if (!view) return;
  view.classList.add('instant-reveal');
  const els = view.getElementsByClassName('portfolio-reveal');
  for (let i = 0; i < els.length; i++) {
    const el = els[i] as HTMLElement;
    el.classList.add('is-visible', 'has-revealed');
    el.classList.remove('portfolio-replay');
    el.dataset.revealAway = 'false';
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      view.classList.remove('invisible');
    });
  });
};

// ─── SoftViews ────────────────────────────────────────────────────────────────
const TRANSITION_MS = 200;

type ViewState = 'hidden' | 'entering' | 'visible' | 'leaving';

function useViewTransition(initialState: ViewState) {
  const [state, setStateRaw] = useState<ViewState>(initialState);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, delay: number) => {
    const id = window.setTimeout(fn, delay);
    timersRef.current.push(id);
  }, []);

  useEffect(() => () => {
    clearTimers();
  }, [clearTimers]);

  return { state, setStateRaw, clearTimers, schedule };
}

function getViewStyle(state: ViewState): React.CSSProperties {
  switch (state) {
    case 'hidden':
      return { display: 'none' };
    case 'entering':
      return {
        opacity: 0,
        filter: 'blur(1px)',
        transform: 'translate3d(0, 6px, 0) scale(0.98)',
        pointerEvents: 'none',
        position: 'relative',
        willChange: 'transform, opacity, filter',
        zIndex: 2,
        transition: `opacity ${TRANSITION_MS}ms cubic-bezier(0.25,0.1,0.25,1),
                     transform ${TRANSITION_MS}ms cubic-bezier(0.25,0.1,0.25,1),
                     filter ${TRANSITION_MS}ms cubic-bezier(0.25,0.1,0.25,1)`,
      };
    case 'leaving':
      return {
        opacity: 0,
        filter: 'blur(1px)',
        transform: 'translate3d(0, -6px, 0) scale(0.98)',
        pointerEvents: 'none',
        position: 'absolute',
        inset: 0,
        willChange: 'transform, opacity, filter',
        transition: `opacity ${TRANSITION_MS}ms cubic-bezier(0.25,0.1,0.25,1),
                     transform ${TRANSITION_MS}ms cubic-bezier(0.25,0.1,0.25,1),
                     filter ${TRANSITION_MS}ms cubic-bezier(0.25,0.1,0.25,1)`,
        zIndex: 1,
      };
    case 'visible':
      return {
        opacity: 1,
        filter: 'blur(0)',
        transform: 'translate3d(0, 0, 0) scale(1)',
        pointerEvents: 'auto',
        position: 'relative',
        willChange: 'transform, opacity, filter',
        zIndex: 2,
        transition: `opacity ${TRANSITION_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94),
                     transform ${TRANSITION_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94),
                     filter ${TRANSITION_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
      };
    default:
      return {};
  }
}

const SoftViews: React.FC<{
  language: Language;
  selectedProject: Project | null;
  setSelectedProject: (p: Project | null) => void;
  selectedCategories: string[];
  setSelectedCategories: (cats: string[]) => void;
  selectedTechs: string[];
  setSelectedTechs: (techs: string[]) => void;
}> = ({
  language,
  selectedProject,
  setSelectedProject,
  selectedCategories,
  setSelectedCategories,
  selectedTechs,
  setSelectedTechs,
}) => {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const [isDownloading, setIsDownloading] = useState(false);
  const homeViewRef = useRef<HTMLDivElement | null>(null);
  const projectsViewRef = useRef<HTMLDivElement | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const loaderTimerRef = useRef<number | null>(null);

  const isHome = location.pathname === '/';
  const isProjects = location.pathname === '/realisations';
  const isNotFound = !isHome && !isProjects;

  const home = useViewTransition(isHome ? 'visible' : 'hidden');
  const projects = useViewTransition(isProjects ? 'visible' : 'hidden');

  useLayoutEffect(() => {
    const path = location.pathname;
    const prev = prevPathRef.current;

    // CRITICAL: Guard clause - only run on actual pathname changes
    if (prev === path) return;

    prevPathRef.current = path;

    const targetSection = consumePendingScrollTarget();

    const applyScroll = () => {
      if (targetSection) {
        jumpToElementWithoutAnimation(targetSection, -80);
      } else {
        jumpToTopWithoutAnimation();
      }
    };

    // -------------------------------------------------
    // CASE 1 – Real route change → start transition
    // -------------------------------------------------
    const startTransition = () => {
      // ----- Home → Projects -----
      if (prev === '/' && path === '/realisations') {
        projects.setStateRaw('entering');
        home.setStateRaw('leaving');

        requestAnimationFrame(() => {
          projects.setStateRaw('visible');
          revealSoftViewElements(projectsViewRef.current);

          // Wait for React to flush updates and paint before scrolling
          requestAnimationFrame(() => {
            // Allow paint to finish, then schedule scroll after paint
            setTimeout(() => {
              applyScroll();
            }, 0);
          });

          if (hideTimerRef.current) {
            window.clearTimeout(hideTimerRef.current);
          }
          hideTimerRef.current = window.setTimeout(() => {
            home.setStateRaw('hidden');
          }, TRANSITION_MS);
        });
      }
      // ----- Projects → Home -----
      else if (prev === '/realisations' && path === '/') {
        home.setStateRaw('entering');
        projects.setStateRaw('leaving');

        requestAnimationFrame(() => {
          home.setStateRaw('visible');
          revealSoftViewElements(homeViewRef.current);

          // Wait for React to flush updates and paint before scrolling
          requestAnimationFrame(() => {
            // Allow paint to finish, then schedule scroll after paint
            setTimeout(() => {
              applyScroll();
            }, 0);
          });

          if (hideTimerRef.current) {
            window.clearTimeout(hideTimerRef.current);
          }
          hideTimerRef.current = window.setTimeout(() => {
            projects.setStateRaw('hidden');
          }, TRANSITION_MS);
        });
      }
      // ----- Fallback: direct access / refresh / 404 -----
      else {
        applyScroll();
        if (isHome) {
          home.setStateRaw('visible');
          projects.setStateRaw('hidden');
        } else if (isProjects) {
          projects.setStateRaw('visible');
          home.setStateRaw('hidden');
        } else {
          home.setStateRaw('hidden');
          projects.setStateRaw('hidden');
        }
      }
    };

    // ----- Chunk loading logic -----
    const isHomeToProjects = prev === '/' && path === '/realisations';
    const isProjectsToHome = prev === '/realisations' && path === '/';
    let chunkPromise: Promise<unknown> | null = null;

    if (isHomeToProjects) {
      chunkPromise = warmChunk('projects', importProjectsPage);
    } else if (isProjectsToHome) {
      chunkPromise = warmChunk('home', importHomePage);
    }

    if (chunkPromise) {
      let resolved = false;
      chunkPromise.then(() => {
        const stillHomeToProjects = prev === '/' && path === '/realisations';
        const stillProjectsToHome = prev === '/realisations' && path === '/';
        if ((isHomeToProjects && stillHomeToProjects) || (isProjectsToHome && stillProjectsToHome)) {
          resolved = true;
          setIsDownloading(false);
          startTransition();
        }
      });

      if (loaderTimerRef.current) {
        window.clearTimeout(loaderTimerRef.current);
      }
      loaderTimerRef.current = window.setTimeout(() => {
        if (!resolved) {
          setIsDownloading(true);
        }
      }, 32);

      chunkPromise.then(() => {
        if (loaderTimerRef.current) {
          window.clearTimeout(loaderTimerRef.current);
          loaderTimerRef.current = null;
        }
      });
    } else {
      startTransition();
    }

    // Cleanup function
    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      if (loaderTimerRef.current) {
        window.clearTimeout(loaderTimerRef.current);
        loaderTimerRef.current = null;
      }
    };
  }, [location]);

  return (
    <div style={{ position: 'relative' }}>
      {isDownloading && <TopLoader />}

      {/* Container for view transitions */}
      <div style={{ position: 'relative' }}>
        {/* ── Home View ── */}
        <div
          ref={homeViewRef}
          style={getViewStyle(home.state)}
          aria-hidden={home.state === 'hidden'}
        >
          <Suspense fallback={null}>
            <MemoizedHomePage language={language} />
          </Suspense>
        </div>

        {/* ── Projects View ── */}
        <div
          ref={projectsViewRef}
          style={getViewStyle(projects.state)}
          aria-hidden={projects.state === 'hidden'}
        >
          <Suspense fallback={null}>
            <MemoizedAllProjectsPage
              language={language}
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              selectedTechs={selectedTechs}
              setSelectedTechs={setSelectedTechs}
            />
          </Suspense>
        </div>
      </div>

      {/* ── 404 Page ── */}
      {isNotFound && <NotFoundPage language={language} />}
    </div>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('fr');
  const [isDark, setIsDark] = useState(false);

  // ---- Lifted state for Projects page ----
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleTheme = useCallback(() => setIsDark((d) => !d), []);

  return (
    <Router basename={['/', './'].includes(import.meta.env.BASE_URL) ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <div className="min-h-screen relative overflow-x-hidden selection:bg-[#b8b2b0]/30 selection:text-[#151621] transition-colors duration-300">
        <BlobTopRight />
        <BlobBottomLeft />

        {/* Add logging to Navbar clicks (we can't modify Navbar directly here, so we log location changes via useEffect) */}
        <Navbar
          language={language}
          setLanguage={setLanguage}
          isDark={isDark}
          toggleTheme={toggleTheme}
          prefetchProjects={prefetchProjects}
        />

        <main className="container mx-auto max-w-7xl">
          <SoftViews
            language={language}
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            selectedTechs={selectedTechs}
            setSelectedTechs={setSelectedTechs}
          />
        </main>

        <footer className="bg-[#151621] dark:bg-black text-[#BDC3C7] py-20 text-center transition-colors border-t border-white/5 mt-12">
          <div className="max-w-5xl mx-auto px-6">
            <p className="font-black text-white text-3xl mb-4 tracking-tighter">RANDRIAMAHERY JASON CHRIS</p>
            <p className="text-sm uppercase tracking-[0.3em] font-bold text-[#b8b2b0]">
              {language === 'fr' ? 'DÉVELOPPEUR FULL-STACK JAVA / DJANGO' : 'FULL-STACK JAVA / DJANGO DEVELOPER'}
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;