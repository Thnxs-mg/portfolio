
import React from 'react';
import { SKILLS, TRANSLATIONS } from '../../constants';
import { Language } from '../../types';
import { CapsuleDivider } from '../Shared/StyledForms';

interface SkillsSectionProps {
  language: Language;
}

const SkillBar: React.FC<{ name: string | Record<Language, string>; level: number; language: Language }> = ({ name, level, language }) => {
  const displayName = typeof name === 'string' ? name : name[language];
  return (
    <div className="mb-5 sm:mb-6">
      <div className="flex justify-between mb-1.5 sm:mb-2">
        <span className="text-xs sm:text-sm font-black text-[#2D3243] dark:text-white uppercase tracking-wider">{displayName}</span>
        <span className="text-[10px] sm:text-xs font-black text-[#52B2BF]">{level}%</span>
      </div>
      <div className="w-full bg-[#BDC3C7] dark:bg-white/10 rounded-full h-2 sm:h-3">
        <div 
          className="bg-[#2D3243] dark:bg-[#52B2BF] h-full rounded-full transition-all duration-1000 ease-out shadow-sm" 
          style={{ width: `${level}%` }}
        ></div>
      </div>
    </div>
  );
};

const SkillsSection: React.FC<SkillsSectionProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  return (
    <section id="skills" className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50 dark:bg-white/[0.02]">
      <div className="max-w-5xl mx-auto">
        <CapsuleDivider className="mb-8 sm:mb-8 w-fit mx-auto md:mx-0">
          {t.sections.skills}
        </CapsuleDivider>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 lg:gap-x-20 gap-y-12 sm:gap-y-16">
          {/* Backend */}
          <div className="scroll-mt-24">
            <h3 className="text-lg sm:text-xl font-black uppercase mb-6 sm:mb-8 text-[#52B2BF] flex items-center gap-3">
              <span className="w-6 sm:w-8 h-1 bg-[#52B2BF] rounded-full"></span>
              Back-end
            </h3>
            {SKILLS.backend.map(skill => <SkillBar key={skill.name as string} {...skill} language={language} />)}
          </div>

          {/* Frontend */}
          <div className="scroll-mt-24">
            <h3 className="text-lg sm:text-xl font-black uppercase mb-6 sm:mb-8 text-[#52B2BF] flex items-center gap-3">
              <span className="w-6 sm:w-8 h-1 bg-[#52B2BF] rounded-full"></span>
              Front-end
            </h3>
            {SKILLS.frontend.map(skill => <SkillBar key={skill.name as string} {...skill} language={language} />)}
          </div>

          {/* Databases */}
          <div className="scroll-mt-24">
            <h3 className="text-lg sm:text-xl font-black uppercase mb-6 sm:mb-8 text-[#52B2BF] flex items-center gap-3">
              <span className="w-6 sm:w-8 h-1 bg-[#52B2BF] rounded-full"></span>
              Databases
            </h3>
            {SKILLS.databases.map(skill => <SkillBar key={skill.name as string} {...skill} language={language} />)}
          </div>

          {/* Languages */}
          <div className="scroll-mt-24">
            <h3 className="text-lg sm:text-xl font-black uppercase mb-8 text-[#52B2BF] flex items-center gap-3">
              <span className="w-6 sm:w-8 h-1 bg-[#52B2BF] rounded-full"></span>
              {language === 'fr' ? 'Langues' : 'Languages'}
            </h3>
            {SKILLS.languages.map(skill => <SkillBar key={typeof skill.name === 'string' ? skill.name : skill.name.en} {...skill} language={language} />)}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
