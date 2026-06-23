import React, { useState, useEffect, useLayoutEffect } from 'react';
// 1. Import des composants de Routing
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Link } from 'react-router-dom';
import { scroller } from 'react-scroll';

import Navbar from './components/Layout/Navbar';
import HeroSection from './components/Sections/HeroSection';
import AboutSection from './components/Sections/AboutSection';
import SkillsSection from './components/Sections/SkillsSection';
import ActiviteGithub from './components/Sections/ActiviteGithub';
import ContactSection from './components/Sections/ContactSection';
import HobbiesSection from './components/Sections/HobbiesSection';
import { BlobTopRight, BlobBottomLeft } from './components/Shared/StyledForms';
import AllProjectsPage from './components/Sections/AllProject';
import { Language } from './types';

const routerBasename = import.meta.env.BASE_URL === '/'
  ? undefined
  : import.meta.env.BASE_URL.replace(/\/$/, '');

type NavigationState = {
  scrollTo?: string;
};

const HomePage: React.FC<{ language: Language }> = ({ language }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const targetSection = (location.state as NavigationState | null)?.scrollTo;

  useEffect(() => {
    if (!targetSection) return;

    requestAnimationFrame(() => {
      scroller.scrollTo(targetSection, {
        smooth: true,
        duration: 420,
        offset: -80,
      });

      navigate('.', { replace: true, state: null });
    });
  }, [targetSection, navigate]);

  return (
    <>
      <HeroSection language={language} />
      <div className="space-y-0">
        <AboutSection language={language} />
        <SkillsSection language={language} />
        <ActiviteGithub language={language} />
        <HobbiesSection language={language} />
        <ContactSection language={language} />
      </div>
    </>
  );
};

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

const AnimatedRoutes: React.FC<{ language: Language }> = ({ language }) => {
  const location = useLocation();

  // Scroll to top synchronously before browser paint on every route change.
  // useLayoutEffect fires after DOM mutations but before the browser paints
  // → no visible scroll snap, smooth transition start from top every time.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div key={location.pathname} className="page-transition">
      <Routes location={location}>
        <Route path="/" element={<HomePage language={language} />} />
        <Route path="/realisations" element={<AllProjectsPage language={language} />} />
        <Route path="*" element={<NotFoundPage language={language} />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('fr');
  const [isDark, setIsDark] = useState(false);

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    // 2. On enveloppe tout dans le Router
    <Router basename={routerBasename}>
      <div className="min-h-screen relative overflow-x-hidden selection:bg-[#b8b2b0]/30 selection:text-[#151621] transition-colors duration-300">
        
        {/* Background Shapes (Visibles sur toutes les pages) */}
        <BlobTopRight />
        <BlobBottomLeft />

        {/* Navbar (Visible sur toutes les pages) */}
        <Navbar
          language={language}
          setLanguage={setLanguage}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />

        <main className="container mx-auto max-w-7xl">
          {/* 3. Système de Routes */}
          <AnimatedRoutes language={language} />
        </main>

        {/* Footer (Visible sur toutes les pages) */}
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
