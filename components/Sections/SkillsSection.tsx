
import React from 'react';
import { CalendarCheck, FileText, Palette, Share2 } from 'lucide-react';
import { TRANSLATIONS } from '../../constants';
import { Language } from '../../types';
import { CapsuleDivider } from '../Shared/StyledForms';

interface SkillsSectionProps {
  language: Language;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const skills = [
    {
      title: {
        fr: 'Gestion de réseaux sociaux',
        en: 'Social media management',
      },
      icon: Share2,
    },
    {
      title: {
        fr: 'Branding et identité visuelle',
        en: 'Branding and visual identity',
      },
      icon: Palette,
    },
    {
      title: {
        fr: 'Planification éditorial',
        en: 'Editorial planning',
      },
      icon: CalendarCheck,
    },
    {
      title: {
        fr: 'Création de contenu',
        en: 'Content creation',
      },
      icon: FileText,
    },
  ];

  return (
    <section id="skills" className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <CapsuleDivider className="mb-8 sm:mb-8 w-fit mx-auto md:mx-0">
          {t.sections.skills}
        </CapsuleDivider>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {skills.map(({ title, icon: Icon }) => (
            <div
              key={title.fr}
              className="group min-h-52 rounded-2xl bg-white dark:bg-[#151621] border border-[#BDC3C7]/30 dark:border-white/10 p-6 sm:p-7 shadow-sm hover:shadow-xl hover:shadow-[#b8b2b0]/10 hover:-translate-y-1 hover:border-[#b8b2b0] transition-all duration-300 flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-xl bg-[#151621] dark:bg-white text-white dark:text-[#151621] flex items-center justify-center group-hover:bg-[#b8b2b0] group-hover:text-white transition-colors">
                <Icon size={24} strokeWidth={2.5} />
              </div>
              <h3 className="mt-8 text-lg sm:text-xl font-black text-[#151621] dark:text-white uppercase leading-snug">
                {title[language]}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
