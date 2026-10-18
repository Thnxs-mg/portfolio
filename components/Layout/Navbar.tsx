import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Menu, X, Sun, Moon, Languages } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { scroller } from 'react-scroll';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { TRANSLATIONS } from '../../constants';
import { cancelActiveScroll, runWithNativeSmoothDisabled, setPendingScrollTarget } from '../../utils/scrollMotion';

interface NavbarProps {
  language: 'fr' | 'en';
  setLanguage: (l: 'fr' | 'en') => void;
  isDark: boolean;
  toggleTheme: () => void;
  prefetchProjects: () => void;
}

const SECTION_IDS = ['home', 'about', 'skills', 'activite', 'contact'];
const SCROLL_DURATION = 760;

const getNavKey = (href: string) => href.startsWith('#') ? href.substring(1) : href;

const Navbar: React.FC<NavbarProps> = ({ language, setLanguage, isDark, toggleTheme, prefetchProjects }) => {
  const [isOpen, setIsOpen] = useState(false);
  const reduced = useReducedMotion();
  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (!isOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [isOpen]);

  const location = useLocation();
  const navigate = useNavigate();
  const requestedPath = useRef(location.pathname);
  useLayoutEffect(() => { requestedPath.current = location.pathname; }, [location.pathname]);

  const [activeSection, setActiveSection] = useState('home');
  // The route always wins over scroll events from the retained home view.
  const activeKey = location.pathname === '/' ? activeSection : location.pathname;
  const [pillStyle, setPillStyle] = useState({ x: 0, width: 0, visible: false });
  const navListRef = useRef<HTMLDivElement | null>(null);
  const navItemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const navLinks = [
    { name: t.nav.home,     href: '#home' },
    { name: t.nav.about,    href: '#about' },
    { name: t.nav.skills,   href: '#skills' },
    { name: t.nav.activite, href: '#activite' },
    { name: t.nav.contact,  href: '#contact' },
    { name: t.nav.projects, href: '/realisations' },
  ];

  useLayoutEffect(() => {
    const list = navListRef.current;
    if (!list) return;
    const syncIndicator = () => {
      const item = navItemRefs.current[activeKey];
      const listRect = list.getBoundingClientRect();
      const itemRect = item?.getBoundingClientRect();
      setPillStyle({
        x: itemRect ? itemRect.left - listRect.left : 0,
        width: itemRect?.width ?? 0,
        visible: !!itemRect?.width,
      });
    };
    syncIndicator();
    // Also follows font loading, translated labels and desktop/mobile breakpoints.
    const observer = new ResizeObserver(syncIndicator);
    observer.observe(list);
    Object.values(navItemRefs.current).forEach(item => { if (item) observer.observe(item); });
    window.addEventListener('resize', syncIndicator);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', syncIndicator);
    };
  }, [activeKey, language]);

  useEffect(() => {
    if (location.pathname !== '/') return;
    let frame = 0;
    const detectSection = () => {
      frame = 0;
      const sections = SECTION_IDS.map(id => document.getElementById(id))
        .filter((element): element is HTMLElement => !!element && element.getClientRects().length > 0);
      if (!sections.length) return;
      let current = 'home';
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= 130) current = section.id;
      }
      if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        current = sections[sections.length - 1].id;
      }
      setActiveSection(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(detectSection); };
    const observer = new ResizeObserver(schedule);
    const content = document.getElementById('main-content');
    if (content) observer.observe(content);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [location.pathname]);

  const isLinkActive = (href: string) => activeKey === getNavKey(href);

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setIsOpen(false);
    cancelActiveScroll();
    if (href.startsWith('#')) {
      const targetId = href.substring(1);
      if (requestedPath.current === '/') {
        runWithNativeSmoothDisabled(() => {
          scroller.scrollTo(targetId, {
            smooth: reduced ? false : 'easeInOutCubic',
            duration: reduced ? 0 : SCROLL_DURATION,
            offset: -80,
          });
        }, SCROLL_DURATION + 120);
      } else {
        setActiveSection(targetId);
        setPendingScrollTarget(targetId);
        requestedPath.current = '/';
        navigate('/');
      }
    } else if (requestedPath.current !== href) {
      // Router rendering can lag behind a second click during a transition.
      requestedPath.current = href;
      navigate(href);
    }
  };

  return (
    <nav className="cinema-nav fixed top-0 left-0 w-full z-[100] bg-white/90 dark:bg-[#12141d]/90 backdrop-blur-md border-b border-[#BDC3C7]/30 dark:border-white/10 shadow-sm transition-colors">
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
            <div ref={navListRef} className="relative flex items-center space-x-1 xl:space-x-2 mr-4 xl:mr-6 border-r border-[#BDC3C7] pr-6 dark:border-white/10">
              <span
                aria-hidden="true"
                className={`cinema-nav-indicator pointer-events-none absolute top-1/2 left-0 h-[calc(100%-4px)] rounded-full ${pillStyle.visible ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  width: pillStyle.width,
                  transform: `translate3d(${pillStyle.x}px, -50%, 0)`,
                }}
              />
              {navLinks.map((link) => {
                const isActive = isLinkActive(link.href);
                const key = getNavKey(link.href);
                const extraProps = link.href === '/realisations' ? { onMouseEnter: prefetchProjects } : {};

                return (
                  <a
                    key={link.name}
                    ref={(element) => {
                      navItemRefs.current[key] = element;
                    }}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    {...extraProps}
                    aria-current={isActive ? (link.href.startsWith('#') ? 'location' : 'page') : undefined}
                    className="relative inline-flex h-11 items-center justify-center px-3 font-semibold text-sm xl:text-base cursor-pointer rounded-full">
                    <span
                      className={`relative z-10 transition-colors duration-150 ${
                        isActive
                          ? 'text-[#45b7aa] dark:text-white'
                          : 'text-[#151621] dark:text-gray-300 hover:text-[#45b7aa] dark:hover:text-[#45b7aa]'
                      }`}
                    >
                      {link.name}
                    </span>
                  </a>
                );
              })}
            </div>

            <div className="flex items-center space-x-3 xl:space-x-4">
              <button
                aria-label={language === 'fr' ? 'Changer le thème' : 'Toggle theme'} onClick={toggleTheme}
                className="grid h-11 w-11 place-items-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-[#151621] dark:text-white"
                title="Toggle Theme"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button
                onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
                className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#151621] dark:border-white/30 text-xs xl:text-sm font-bold hover:bg-[#151621] hover:text-white dark:hover:bg-white dark:hover:text-[#151621] transition-all">
                  <Languages size={14} />
                  {language.toUpperCase()}
                </button>
            </div>
          </div>

          {/* Mobile menu controls */}
          <div className="lg:hidden flex items-center space-x-2">
            <button aria-label={language === 'fr' ? 'Changer le thème' : 'Toggle theme'} onClick={toggleTheme} className="grid h-11 w-11 place-items-center text-[#151621] dark:text-white rounded-full hover:bg-gray-100 dark:hover:bg-white/5">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              aria-label={isOpen ? (language === 'fr' ? 'Fermer le menu' : 'Close menu') : (language === 'fr' ? 'Ouvrir le menu' : 'Open menu')}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#151621] dark:text-white hover:text-[#45b7aa] p-2"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0, y: reduced ? 0 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -8 }}
            transition={{ duration: reduced ? 0 : 0.18, ease: 'easeOut' }}
            className="lg:hidden absolute top-full left-0 w-full bg-white dark:bg-[#1a1d23] border-t border-[#BDC3C7] dark:border-white/10 shadow-2xl">
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
                        ? 'text-[#151621] dark:text-white bg-[#45b7aa]/15 dark:bg-[#45b7aa]/20 border border-[#45b7aa]/30'
                        : 'text-[#151621] dark:text-gray-300 hover:bg-[#45b7aa] hover:text-white'
                    }`}
                    aria-current={isActive ? (link.href.startsWith('#') ? 'location' : 'page') : undefined}
                    >{link.name}</a>
                );
              })}
              <div className="pt-4 flex justify-between items-center px-4">
                <button
                  onClick={() => { setLanguage(language === 'fr' ? 'en' : 'fr'); setIsOpen(false); }}
                  className="flex items-center gap-2 px-6 py-2 rounded-full border border-[#151621] dark:border-white/30 text-sm font-bold dark:text-white">
                  <Languages size={18} />
                  {language === 'fr' ? 'Switch to English' : 'Passer en Français'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
