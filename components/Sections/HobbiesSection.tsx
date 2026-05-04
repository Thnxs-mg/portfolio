
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
    <section id="hobbies" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <CapsuleDivider className="mb-8 w-fit mx-auto md:mx-0">
          {t.sections.hobbies}
        </CapsuleDivider>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {HOBBIES[language].map((hobby, idx) => (
            <div key={idx} className="p-10 rounded-3xl border border-[#BDC3C7]/30 dark:border-white/10 shadow-sm flex flex-col items-center justify-center text-center hover:border-[#b8b2b0] dark:hover:border-[#b8b2b0] transition-all group">
              <div className="w-2 h-10 bg-[#b8b2b0] mb-6 rounded-full group-hover:w-10 transition-all duration-500"></div>
              <p className="text-[#151621] dark:text-white font-black text-lg uppercase tracking-tight">{hobby}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HobbiesSection;
