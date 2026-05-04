import React, { useState, useEffect } from 'react';
// 1. Import des composants de Routing
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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
    <Router basename="/jason-chris-portfolio">
      <div className="min-h-screen relative overflow-x-hidden selection:bg-[#52B2BF]/30 selection:text-[#2D3243] transition-colors duration-300">
        
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
          <Routes>
            
            {/* === PAGE D'ACCUEIL === */}
            <Route path="/" element={
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
            } />

            {/* === PAGE TOUS LES PROJETS === */}
            <Route path="/projects" element={
              <AllProjectsPage language={language} />
            } />

          </Routes>
        </main>

        {/* Footer (Visible sur toutes les pages) */}
        <footer className="bg-[#2D3243] dark:bg-black text-[#BDC3C7] py-20 text-center transition-colors border-t border-white/5 mt-12">
          <div className="max-w-5xl mx-auto px-6">
            <p className="font-black text-white text-3xl mb-4 tracking-tighter">RANDRIAMAHERY JASON CHRIS</p>
            <p className="text-sm uppercase tracking-[0.3em] font-bold text-[#52B2BF]">
              {language === 'fr' ? 'DÉVELOPPEUR FULL-STACK JAVA / DJANGO' : 'FULL-STACK JAVA / DJANGO DEVELOPER'}
            </p>
          </div>
        </footer>

      </div>
    </Router>
  );
};

export default App;