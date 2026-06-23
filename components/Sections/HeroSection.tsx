import React from 'react';
import { useNavigate } from 'react-router-dom'; // Pour la navigation entre pages
import { scroller } from 'react-scroll'; // Pour le scroll fluide vers les sections
import { PERSONAL_INFO, TRANSLATIONS } from '../../constants';
import { Language } from '../../types';
import profilePicture from '../../assets/pro_picture.png';

interface HeroSectionProps {
  language: Language;
}

const HeroSection: React.FC<HeroSectionProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const navigate = useNavigate();

  const jumpToTop = () => {
    document.dispatchEvent(new WheelEvent('wheel', { deltaY: 0, cancelable: true }));
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previousScrollBehavior;
  };

  // Fonction pour scroller proprement vers la section Contact
  const handleScrollToContact = (e: React.MouseEvent) => {
    e.preventDefault(); // Empêche le saut brutal par défaut
    scroller.scrollTo('contact', {
      smooth: true,
      duration: 420,
      offset: -80, // Ajustement pour ne pas être caché par la navbar
    });
  };

  // Fonction pour aller vers la page Projets
  const handleGoToProjects = (e: React.MouseEvent) => {
    e.preventDefault();
    jumpToTop();
    navigate('/realisations');
  };

  return (
    <section id="home" className="relative pt-24 sm:pt-36 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-12 overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 sm:gap-12">
        {/* Photo Container */}
        <div className="relative group">
          <div className="absolute -inset-2 sm:-inset-4 bg-[#b8b2b0] rounded-full opacity-20 -z-10 animate-pulse"></div>
          <div className="w-48 h-48 sm:w-60 h-60 md:w-72 md:h-72 rounded-full border-4 sm:border-8 border-[#151621] dark:border-[#b8b2b0] overflow-hidden shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-105">
            <img
              src={profilePicture}
              alt={PERSONAL_INFO.fullName}
              className="w-full h-full object-cover grayscale-[10%]"
            />
          </div>
          {/* Accent Badge */}
          <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-10 h-10 sm:w-16 sm:h-16 bg-[#b8b2b0] rounded-full border-4 border-white dark:border-[#12141d] z-20 flex items-center justify-center text-white font-black text-xl sm:text-2xl">
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center md:text-left relative z-10 max-w-2xl mt-4 md:mt-10 lg:mt-14">
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-[#151621] dark:text-white leading-[1.1] mb-4 tracking-tighter">
            {PERSONAL_INFO.fullName}
          </h1>
          <div className="h-1.5 sm:h-2 w-20 sm:w-32 bg-[#b8b2b0] mb-6 sm:mb-8 mx-auto md:mx-0 rounded-full"></div>
          <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-[#151621]/80 dark:text-gray-400 uppercase tracking-widest leading-snug">
            {PERSONAL_INFO.title[language]}
          </p>
          <p className="mt-4 text-sm sm:text-base lg:text-lg text-[#151621]/70 dark:text-gray-300 leading-relaxed max-w-xl mx-auto md:mx-0">
            {PERSONAL_INFO.tagline[language]}
          </p>
          
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center md:justify-start gap-4">
            
            {/* Bouton 1 : Voir Projets (Utilise useNavigate) */}
            <a
              href="/realisations"
              onClick={handleGoToProjects}
              className="h-10 sm:h-12 px-8 bg-[#151621] dark:bg-[#b8b2b0] text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {t.hero.viewProjects}
            </a>

            {/* Bouton 2 : Contact (Utilise react-scroll) */}
            <a
              href="#contact"
              onClick={handleScrollToContact}
              className="h-10 sm:h-12 px-8 border-2 border-[#151621] dark:border-white text-[#151621] dark:text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm uppercase tracking-widest hover:bg-[#151621] hover:text-white dark:hover:bg-white dark:hover:text-[#151621] transition-all transform hover:-translate-y-1 cursor-pointer"
            >
              {t.hero.contactMe}
            </a>
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
