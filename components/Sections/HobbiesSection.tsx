
import React from 'react';
import { HOBBIES, TRANSLATIONS } from '../../constants';
// Import Language type from types.ts instead of constants.ts
import { Language } from '../../types';
import { CapsuleDivider } from '../Shared/StyledForms';

interface HobbiesSectionProps {
  language: Language;
}

const HobbiesSection: React.FC<HobbiesSectionProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  return (
    <section className="py-24 px-6 bg-white dark:bg-[#12141d]">
      <div className="max-w-5xl mx-auto">
        <CapsuleDivider className="mb-8 w-fit mx-auto md:mx-0">
          {t.sections.hobbies}
        </CapsuleDivider>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {HOBBIES[language].map((hobby, idx) => (
            <div key={idx} className="bg-white dark:bg-white/5 p-10 rounded-3xl border border-[#BDC3C7]/30 dark:border-white/10 shadow-sm flex flex-col items-center justify-center text-center hover:border-[#52B2BF] dark:hover:border-[#52B2BF] transition-all group">
              <div className="w-2 h-10 bg-[#52B2BF] mb-6 rounded-full group-hover:w-10 transition-all duration-500"></div>
              <p className="text-[#2D3243] dark:text-white font-black text-lg uppercase tracking-tight">{hobby}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HobbiesSection;