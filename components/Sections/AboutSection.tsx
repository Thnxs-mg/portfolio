import React from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import nécessaire
import { EDUCATION, TRANSLATIONS } from '../../constants';
import { Language } from '../../types';
import { CapsuleDivider } from '../Shared/StyledForms';
import { ArrowRight, Layers, GraduationCap } from 'lucide-react';

interface AboutSectionProps {
  language: Language;
}

const AboutSection: React.FC<AboutSectionProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const navigate = useNavigate(); // 2. Initialisation du hook

  // 3. Fonction de navigation (identique à HeroSection)
  const handleGoToProjects = (e: React.MouseEvent) => {
    e.preventDefault(); // Empêche le rechargement de page (l'erreur 404)
    navigate('/projects'); // Le Router sait qu'il doit ajouter le basename tout seul
    window.scrollTo(0, 0);
  };

  return (
    <section id="about" className="py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-16 sm:space-y-24">

        {/* --- Education Section --- */}
        <div className="scroll-mt-24">
          <CapsuleDivider className="mb-10 sm:mb-12 w-fit mx-auto sm:mx-0">
            {t.sections.education}
          </CapsuleDivider>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-12">
            {EDUCATION[language].map((edu, idx) => (
              <div key={idx} className="relative pl-8 group">
                <div className="absolute left-0 top-1 bottom-1 w-1.5 bg-[#BDC3C7]/30 dark:bg-white/10 rounded-full group-hover:bg-[#52B2BF] transition-colors duration-500"></div>

                <div className="flex items-start gap-3 mb-2">
                  <div className="p-2 bg-[#52B2BF]/10 rounded-lg text-[#52B2BF] opacity-0 group-hover:opacity-100 transition-opacity -ml-2 sm:ml-0">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-[#2D3243] dark:text-white leading-tight">
                      {edu.degree}
                    </h3>
                    <p className="text-[#52B2BF] font-extrabold uppercase tracking-widest text-xs sm:text-sm mt-1">
                      {edu.school}
                    </p>
                  </div>
                </div>

                <div className="pl-12">
                  {edu.details && (
                    <p className="text-sm text-[#2D3243]/60 dark:text-gray-400 font-medium leading-relaxed pl-2 sm:pl-0 border-l-2 border-transparent sm:border-none">
                      {edu.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="scroll-mt-24">
          <CapsuleDivider className="mb-10 sm:mb-12 w-fit mx-auto sm:mx-0">
            {t.sections.academicProjects}
          </CapsuleDivider>

          {/* --- Academic Projects Teaser (CTA CARD) --- */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-[#2D3243] dark:bg-white/5 p-8 sm:p-12 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 shadow-2xl shadow-[#2D3243]/10 dark:shadow-none group">
            <div className="absolute top-0 right-0 bg-[#52B2BF] rounded-full blur-[80px] opacity-10 sm:opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="relative z-10 max-w-lg">
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
                {language === 'fr' ? "Curieux de voir mes réalisations ?" : "Curious to see what I've built?"}
              </h3>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                {language === 'fr'
                  ? "Découvrez l'ensemble de mes projets académiques et personnels, ainsi que mon activité récente sur GitHub."
                  : "Discover all my academic and personal projects, as well as my recent activity on GitHub."}
              </p>
            </div>

            <div className="relative z-10 shrink-0">
              {/* 4. MODIFICATION ICI : Utilisation du onClick au lieu du href direct */}
              <a
                href="/projects" 
                onClick={handleGoToProjects}
                className="flex items-center gap-3 px-8 py-4 rounded-full bg-white text-[#2D3243] hover:bg-[#52B2BF] hover:text-white transition-all duration-300 font-black uppercase tracking-widest text-sm shadow-xl transform hover:-translate-y-1 cursor-pointer"
              >
                <Layers size={20} />
                {language === 'fr' ? "Voir les projets" : "View Projects"}
                <ArrowRight size={20} />
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutSection;