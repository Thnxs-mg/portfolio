import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, Languages } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { scroller } from 'react-scroll';
import { TRANSLATIONS } from '../../constants';
import { Language } from '../../types';

interface NavbarProps {
  language: 'fr' | 'en';
  setLanguage: (l: 'fr' | 'en') => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ language, setLanguage, isDark, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');
  const t = TRANSLATIONS[language];
  
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: t.nav.home, href: '#home' },
    { name: t.nav.about, href: '#about' },
    { name: t.nav.skills, href: '#skills' },
    { name: t.nav.activite, href: '#activite' }, // ID de la section GitHub
    { name: t.nav.contact, href: '#contact' },
    { name: t.nav.projects, href: '/realisations' },
  ];

  // --- LOGIQUE DE DÉTECTION DU SCROLL ---
  useEffect(() => {
    // Si on est sur la page Projets, on force l'état actif sur le lien Projets
    if (location.pathname === '/realisations' || location.pathname === '/projects') {
      setActiveSection('/realisations');
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Offset pour déclencher un peu avant

      navLinks.forEach((link) => {
        if (link.href.startsWith('#')) {
          const sectionId = link.href.substring(1);
          const element = document.getElementById(sectionId);
          
          if (element) {
            const { offsetTop, offsetHeight } = element;
            // Vérifie si le scroll est dans la zone de la section
            if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
              setActiveSection(sectionId);
            }
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]); // Dépendance simplifiée

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);

    if (href.startsWith('#')) {
      const targetId = href.substring(1);
      
      // On met à jour l'état tout de suite pour le feedback visuel
      setActiveSection(targetId);

      if (location.pathname === '/') {
        window.dispatchEvent(new CustomEvent('portfolio:section-change'));
        scroller.scrollTo(targetId, {
          smooth: true,
          duration: 420,
          offset: -80,
        });
      } else {
        navigate('/', { state: { scrollTo: targetId } });
      }
    } else {
      setActiveSection(href);
      navigate(href);
    }
  };

  // Helper simple
  const isLinkActive = (href: string) => {
    if (href.startsWith('#')) return activeSection === href.substring(1);
    return activeSection === href;
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] bg-white/90 dark:bg-[#12141d]/90 backdrop-blur-md border-b border-[#BDC3C7]/30 dark:border-white/10 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-20 items-center">
          
          {/* LOGO */}
          <div className="flex-shrink-0 flex items-center">
            <a 
              href="#home"
              onClick={(e) => handleNavClick(e, '#home')}
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              aria-label="Retour à l'accueil"
            >
              <span className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#030303] text-white flex items-center justify-center font-black text-lg sm:text-xl tracking-tight">
                JC
              </span>
              <span className="text-[#151621] dark:text-white font-black text-lg sm:text-xl tracking-tight">
                Jason Chris
              </span>
            </a>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <div className="flex space-x-5 xl:space-x-8 mr-4 xl:mr-6 border-r border-[#BDC3C7] pr-6 dark:border-white/10">
              {navLinks.map((link) => {
                const isActive = isLinkActive(link.href);
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`font-semibold transition-colors duration-200 text-sm xl:text-base cursor-pointer ${
                      isActive 
                        ? 'text-[#b8b2b0] dark:text-white dark:drop-shadow-[0_0_8px_rgba(184,178,176,0.65)]'
                        : 'text-[#151621] dark:text-gray-300 hover:text-[#b8b2b0] dark:hover:text-[#b8b2b0]' // Inactif
                    }`}
                  >
                    {link.name}
                  </a>
                );
              })}
            </div>
            
            <div className="flex items-center space-x-3 xl:space-x-4">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-[#151621] dark:text-white"
                title="Toggle Theme"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button 
                onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
                className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#151621] dark:border-white/30 text-xs xl:text-sm font-bold hover:bg-[#151621] hover:text-white dark:hover:bg-white dark:hover:text-[#151621] transition-all"
              >
                <Languages size={14} />
                {language.toUpperCase()}
              </button>
            </div>
          </div>

          {/* Mobile menu controls */}
          <div className="lg:hidden flex items-center space-x-2">
             <button onClick={toggleTheme} className="p-2 text-[#151621] dark:text-white rounded-full hover:bg-gray-100 dark:hover:bg-white/5">
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#151621] dark:text-white hover:text-[#b8b2b0] p-2"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <div className={`lg:hidden absolute top-full left-0 w-full bg-white dark:bg-[#1a1d23] border-t border-[#BDC3C7] dark:border-white/10 transition-all duration-300 shadow-2xl ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
          <div className="px-4 py-6 space-y-2">
            {navLinks.map((link) => {
              const isActive = isLinkActive(link.href);
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`block px-4 py-4 rounded-xl font-bold transition-all text-lg cursor-pointer ${
                    isActive 
                      ? 'text-[#151621] dark:text-white bg-[#b8b2b0]/15 dark:bg-[#b8b2b0]/20 border border-[#b8b2b0]/30'
                      : 'text-[#151621] dark:text-gray-300 hover:bg-[#b8b2b0] hover:text-white'
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
            <div className="pt-4 flex justify-between items-center px-4">
               <button 
                  onClick={() => { setLanguage(language === 'fr' ? 'en' : 'fr'); setIsOpen(false); }}
                  className="flex items-center gap-2 px-6 py-2 rounded-full border border-[#151621] dark:border-white/30 text-sm font-bold dark:text-white"
                >
                  <Languages size={18} />
                  {language === 'fr' ? 'Switch to English' : 'Passer en Français'}
                </button>
            </div>
          </div>
      </div>
    </nav>
  );
};

export default Navbar;
