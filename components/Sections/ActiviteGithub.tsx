import React from 'react';
import { useGitHubData } from '../../hooks/useGitHubData';
import { GITHUB_USERNAME, TRANSLATIONS } from '../../constants';
import { Language } from '../../types';
import { Github, ExternalLink, GitCommit, BarChart3, PieChart, ArrowRight } from 'lucide-react';
import { CapsuleDivider } from '../Shared/StyledForms';

interface ActiviteGithubProps {
  language: Language;
}

const ActiviteGithub: React.FC<ActiviteGithubProps> = ({ language }) => {
  const { user, loading, error } = useGitHubData(GITHUB_USERNAME);
  const t = TRANSLATIONS[language];

  // Configuration du thème pour les images générées (Readme Stats)
  // On force un fond blanc pour que l'image se fonde dans la carte blanche
  // Textes en #2D3243 (ton bleu foncé) et Titres en #52B2BF (ton cyan)
  const statsThemeParams = "&bg_color=ffffff&title_color=52B2BF&text_color=2D3243&icon_color=52B2BF&hide_border=true&ring_color=52B2BF";

  return (
    <section id="activite" className="py-24 px-4 sm:px-6 bg-[#BDC3C7]/5 dark:bg-white/[0.01]">
      <div className="max-w-5xl mx-auto">

        {/* --- En-tête de la section --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 sm:mb-8 gap-6 sm:gap-8">
          <CapsuleDivider>
            {language === 'fr' ? 'Activité GitHub' : 'GitHub Activity'}
          </CapsuleDivider>

          {user && (
            <a
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#2D3243] dark:bg-white text-white dark:text-[#2D3243] px-6 py-3 rounded-full font-black text-xs sm:text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
            >
              <Github size={18} />
              <span>@{GITHUB_USERNAME}</span>
              <ExternalLink size={14} className="opacity-70" />
            </a>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-[#52B2BF]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-red-50 rounded-[2rem] border border-red-100">
            <p className="text-[#E74C3C] font-black text-lg">{error}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">

            {/* --- 1. Carte Calendrier (Contributions) --- */}
            <div className="bg-white dark:bg-[#2D3243] p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl hover:-translate-y-2 transition-transform duration-300 flex flex-col h-full group">
              <div className="flex items-center gap-4 sm:gap-6 mb-8">
                <div className="p-3 bg-[#2D3243] dark:bg-white text-white dark:text-[#2D3243] rounded-xl shadow-md">
                  <GitCommit size={24} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#2D3243] dark:text-white uppercase tracking-widest">
                    {language === 'fr' ? 'Contributions' : 'Contributions'}
                  </h3>
                  <p className="text-[#BDC3C7] dark:text-[#52B2BF] text-xs font-black uppercase tracking-wider">
                    {new Date().getFullYear()} Timeline
                  </p>
                </div>
              </div>

              <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
                {/* Image du graphique (Générée dynamiquement) */}
                <img
                  src={`https://ghchart.rshah.org/52B2BF/${GITHUB_USERNAME}`}
                  alt="Github Contribution Chart"
                  className="w-full min-w-[700px] opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>

            {/* --- 2. Grille Statistiques & Langages --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">

              {/* Carte Stats Globales */}
              <div className="bg-white dark:bg-[#2D3243] p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl hover:-translate-y-2 transition-transform duration-300 flex flex-col h-full group">
                <div className="flex items-center gap-4 ">
                  <div className="p-3 bg-[#2D3243] dark:bg-white text-white dark:text-[#2D3243] rounded-xl shadow-md">
                    <BarChart3 size={20} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-[#2D3243] dark:text-white uppercase tracking-widest">
                    {language === 'fr' ? 'Statistiques' : 'Global Stats'}
                  </h3>
                </div>

                <div className="flex-grow flex items-center justify-center py-4">
                  {/* On utilise l'API mais on s'assure que le fond correspond à notre carte */}
                  <img
                    src={`https://github-readme-stats.vercel.app/api?username=${GITHUB_USERNAME}&show_icons=true&count_private=true&rank_icon=github${statsThemeParams}`}
                    alt="Github Stats"
                    className="w-full h-auto max-w-[400px] "
                  />
                </div>
              </div>

              {/* Carte Langages */}
              <div className="bg-white dark:bg-[#2D3243] p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl hover:-translate-y-2 transition-transform duration-300 flex flex-col h-full group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#2D3243] dark:bg-white text-white dark:text-[#2D3243] rounded-xl shadow-md">
                    <PieChart size={20} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-[#2D3243] dark:text-white uppercase tracking-widest">
                    {language === 'fr' ? 'Langages' : 'Languages'}
                  </h3>
                </div>

                <div className="flex-grow flex items-center justify-center py-4">
                  <img
                    src={`https://github-readme-stats.vercel.app/api/top-langs/?username=${GITHUB_USERNAME}&layout=compact&langs_count=6${statsThemeParams}`}
                    alt="Top Languages"
                    className="w-full h-auto max-w-[400px] "
                  />
                </div>
              </div>

            </div>

            {/* --- 3. Footer / Lien Call to Action --- */}
            <div className="flex justify-center mt-8">
              <a
                href={`https://github.com/${GITHUB_USERNAME}?tab=repositories`}
                target="_blank"
                rel="noopener noreferrer"
                className="group text-[#2D3243] dark:text-white flex items-center gap-2 text-sm font-black uppercase tracking-widest hover:text-[#52B2BF] dark:hover:text-[#52B2BF] transition-colors"
              >
                {language === 'fr' ? 'Voir tous les dépôts' : 'View all repositories'}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

          </div>
        )}
      </div>
    </section>
  );
};

export default ActiviteGithub;