import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, Suspense } from 'react';
import { BrowserRouter as Router, useLocation, useNavigate, Link } from 'react-router-dom';

import Navbar from './components/Layout/Navbar';
import { BlobTopRight, BlobBottomLeft } from './components/Shared/StyledForms';
import { jumpToElementWithoutAnimation, jumpToTopWithoutAnimation, consumePendingScrollTarget } from './utils/scrollMotion';
import { Language } from './types';
import { TopLoader } from './components/Shared/TopLoader';

// ─── Import factories ─────────────────────────────────────────────────────────
// On garde les factories pour React.lazy (first render path)
// ET pour le pré-cache manuel via chunkCache.
const importHomePage = () => import('./components/Sections/HomePage');
const importProjectsPage = () => import('./components/Sections/AllProject');

const HomePage = React.lazy(importHomePage);
const AllProjectsPage = React.lazy(importProjectsPage);

// ─── Chunk cache ──────────────────────────────────────────────────────────────
// Conserve la Promise résolue pour éviter toute attente réseau lors des
// navigations successives. Si la Promise est déjà dans le cache, l'appel
// .then() est microtask-scheduled (< 1 ms) au lieu d'un vrai réseau I/O.
const chunkCache: Record<string, Promise<unknown>> = {};

const warmChunk = (key: string, factory: () => Promise<unknown>) => {
  if (!chunkCache[key]) {
    chunkCache[key] = factory();
  }
  return chunkCache[key];
};

// On pré-charge la page Projets dès que le navigateur est idle
// pour qu'elle soit déjà en cache au premier clic de l'utilisateur.
if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
  (window as Window & typeof globalThis & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => {
    warmChunk('projects', importProjectsPage);
  });
} else if (typeof window !== 'undefined') {
  setTimeout(() => warmChunk('projects', importProjectsPage), 2000);
}

const routerBasename = import.meta.env.BASE_URL === '/'
  ? undefined
  : import.meta.env.BASE_URL.replace(/\/$/, '');

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
// Force tous les éléments .portfolio-reveal d'une vue à être immédiatement
// visibles (sans délai de stagger ni transition lente) lors d'un changement de page.
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

  // Restaure la transition après 2 frames pour les futurs scrolls
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      view.classList.remove('instant-reveal');
    });
  });
};

// ─── SoftViews ────────────────────────────────────────────────────────────────
//
// ARCHITECTURE :
//   - Les deux pages (Home + Projects) sont gardées en mémoire une fois montées
//     pour éviter de détruire/recréer les hooks de fetch GitHub à chaque nav.
//   - L'état `mounted` différé : la page "Projects" n'est montée QUE lors du
//     premier accès, évitant les fetches réseau inutiles au démarrage.
//   - Transition via CSS `opacity/transform` à 160 ms. La page sortante prend
//     `position:absolute` le temps de la transition pour ne pas pousser le layout.
//   - La page cachée passe à `display:none` (via `hidden`) dès que la transition
//     est terminée, ce qui :
//       a) supprime tout scrollbar fantôme
//       b) retire la page du layout engine du navigateur (0 coût CPU/GPU)
//       c) préserve l'état React (hooks, fetch cache, scroll position ref)
//
const TRANSITION_MS = 160;

type ViewState = 'hidden' | 'entering' | 'visible' | 'leaving';

function useViewTransition(initialState: ViewState) {
  const [state, setStateRaw] = useState<ViewState>(initialState);
  // On garde une ref pour annuler les timers en cas de navigation rapide
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, delay: number) => {
    const id = window.setTimeout(fn, delay);
    timersRef.current.push(id);
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return { state, setStateRaw, clearTimers, schedule };
}

function getViewStyle(state: ViewState): React.CSSProperties {
  switch (state) {
    case 'hidden':
      // display:none → complètement hors du layout, aucun scrollbar fantôme
      return { display: 'none' };

    case 'entering':
      // Prêt à animer : visible dans le DOM, opaque à 0, sans transition active
      // (la transition sera activée dans le prochain tick via 'visible')
      return {
        opacity: 0,
        transform: 'translateY(10px)',
        pointerEvents: 'none',
        position: 'relative',
        willChange: 'opacity, transform',
      };

    case 'leaving':
      // Sort du flux normal (absolute) pour ne pas pousser le layout entrant
      // La transition CSS fait fondre la page sortante vers opacity:0
      return {
        opacity: 0,
        transform: 'translateY(-10px)',
        pointerEvents: 'none',
        position: 'absolute',
        inset: 0,
        transition: `opacity ${TRANSITION_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94),
                     transform ${TRANSITION_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
        willChange: 'opacity, transform',
        zIndex: 1,
      };

    case 'visible':
      return {
        opacity: 1,
        transform: 'translateY(0)',
        pointerEvents: 'auto',
        position: 'relative',
        transition: `opacity ${TRANSITION_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94),
                     transform ${TRANSITION_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
        willChange: 'opacity, transform',
        zIndex: 2,
      };
  }
}

const SoftViews: React.FC<{ language: Language }> = ({ language }) => {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  const isHome = location.pathname === '/';
  const isProjects = location.pathname === '/realisations';
  const isNotFound = !isHome && !isProjects;

  // Montage différé : on ne monte une page que lors du premier accès
  const homeMounted = useRef(isHome);
  const projectsMounted = useRef(isProjects);

  const homeViewRef = useRef<HTMLDivElement | null>(null);
  const projectsViewRef = useRef<HTMLDivElement | null>(null);

  // Machine d'état indépendante pour chaque vue
  const home = useViewTransition(isHome ? 'visible' : 'hidden');
  const projects = useViewTransition(isProjects ? 'visible' : 'hidden');
  
  const [isDownloading, setIsDownloading] = useState(false);

  useLayoutEffect(() => {
    const path = location.pathname;
    const prev = prevPathRef.current;
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

    // ── Home → Projects ──────────────────────────────────────────────────────
    if (prev === '/' && path === '/realisations') {
      // On lance le chargement du chunk (synchrone si déjà en cache).
      const chunkPromise = warmChunk('projects', importProjectsPage);

      const startTransition = () => {
        projectsMounted.current = true;
        home.clearTimers();
        projects.clearTimers();
        home.setStateRaw('leaving');
        projects.setStateRaw('entering');

        requestAnimationFrame(() => {
          applyScroll();
          revealSoftViewElements(projectsViewRef.current);

          requestAnimationFrame(() => {
            projects.setStateRaw('visible');
            home.schedule(() => home.setStateRaw('hidden'), TRANSITION_MS);
          });
        });
      };

      // Si le chunk est déjà résolu (microtask ≈ 0 ms), on démarre la
      // transition dans la même frame. Sinon on affiche le TopLoader.
      let resolved = false;
      chunkPromise.then(() => {
        resolved = true;
        setIsDownloading(false);
        startTransition();
      });

      // Délai de 32 ms (2 frames) avant d'afficher le loader pour éviter
      // un flash du loader sur les navigations ultra-rapides (chunk en cache).
      const loaderTimer = window.setTimeout(() => {
        if (!resolved) setIsDownloading(true);
      }, 32);

      // Cleanup du timer si le chunk se résout avant 32 ms
      chunkPromise.then(() => window.clearTimeout(loaderTimer));
      return;
    }

    // ── Projects → Home ──────────────────────────────────────────────────────
    if (prev === '/realisations' && path === '/') {
      const chunkPromise = warmChunk('home', importHomePage);

      const startTransition = () => {
        homeMounted.current = true;
        home.clearTimers();
        projects.clearTimers();
        projects.setStateRaw('leaving');
        home.setStateRaw('entering');

        requestAnimationFrame(() => {
          applyScroll();
          revealSoftViewElements(homeViewRef.current);

          requestAnimationFrame(() => {
            home.setStateRaw('visible');
            projects.schedule(() => projects.setStateRaw('hidden'), TRANSITION_MS);
          });
        });
      };

      let resolved = false;
      chunkPromise.then(() => {
        resolved = true;
        setIsDownloading(false);
        startTransition();
      });

      const loaderTimer = window.setTimeout(() => {
        if (!resolved) setIsDownloading(true);
      }, 32);

      chunkPromise.then(() => window.clearTimeout(loaderTimer));
      return;
    }

    // ── Fallback : accès direct / refresh / 404 ───────────────────────────────
    applyScroll();
    if (isHome) {
      homeMounted.current = true;
      home.setStateRaw('visible');
      projects.setStateRaw('hidden');
    } else if (isProjects) {
      projectsMounted.current = true;
      projects.setStateRaw('visible');
      home.setStateRaw('hidden');
    } else {
      home.setStateRaw('hidden');
      projects.setStateRaw('hidden');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div style={{ position: 'relative' }}>
      
      {isDownloading && <TopLoader />}

      {/* ── Vue Accueil ── */}
      <div
        ref={homeViewRef}
        style={getViewStyle(home.state)}
        aria-hidden={home.state === 'hidden'}
      >
        <Suspense fallback={null}>
          {homeMounted.current && <HomePage language={language} />}
        </Suspense>
      </div>

      {/* ── Vue Projets ── */}
      <div
        ref={projectsViewRef}
        style={getViewStyle(projects.state)}
        aria-hidden={projects.state === 'hidden'}
      >
        <Suspense fallback={null}>
          {projectsMounted.current && <AllProjectsPage language={language} />}
        </Suspense>
      </div>

      {/* ── 404 ── */}
      {isNotFound && <NotFoundPage language={language} />}

    </div>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('fr');
  const [isDark, setIsDark] = useState(false);

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
    <Router basename={routerBasename}>
      <div className="min-h-screen relative overflow-x-hidden selection:bg-[#b8b2b0]/30 selection:text-[#151621] transition-colors duration-300">

        <BlobTopRight />
        <BlobBottomLeft />

        <Navbar
          language={language}
          setLanguage={setLanguage}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />

        <main className="container mx-auto max-w-7xl">
          <SoftViews language={language} />
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
