
import React from 'react';
import { TRANSLATIONS } from '../../constants';
// Import Language type from types.ts instead of constants.ts
import { Language } from '../../types';
import { CapsuleDivider } from '../Shared/StyledForms';
import { Bike, BookOpen, Camera, Code2, Music, Palette } from 'lucide-react';
import { useRevealOnScroll } from '../../hooks/useRevealOnScroll';

interface HobbiesSectionProps {
  language: Language;
}

const hobbyGroups = {
  fr: [
    {
      title: 'Musique',
      items: ['Guitare', 'Chant'],
      icon: Music,
    },
    {
      title: 'Arts & lecture',
      items: ['Dessin', 'Lecture'],
      icon: Palette,
      secondaryIcon: BookOpen,
    },
    {
      title: 'Sport',
      items: ['Cyclisme', 'Volley-ball'],
      icon: Bike,
    },
    {
      title: 'Tech & image',
      items: ['Programmation', 'Photographie'],
      icon: Code2,
      secondaryIcon: Camera,
    },
  ],
  en: [
    {
      title: 'Music',
      items: ['Guitar', 'Singing'],
      icon: Music,
    },
    {
      title: 'Art & reading',
      items: ['Drawing', 'Reading'],
      icon: Palette,
      secondaryIcon: BookOpen,
    },
    {
      title: 'Sport',
      items: ['Cycling', 'Volleyball'],
      icon: Bike,
    },
    {
      title: 'Tech & image',
      items: ['Programming', 'Photography'],
      icon: Code2,
      secondaryIcon: Camera,
    },
  ],
};

const HobbiesSection: React.FC<HobbiesSectionProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const revealRef = useRevealOnScroll<HTMLElement>();

  return (
    <section ref={revealRef} id="hobbies" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <CapsuleDivider className="portfolio-reveal mb-8 w-fit mx-auto md:mx-0">
          {t.sections.hobbies}
        </CapsuleDivider>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {hobbyGroups[language].map((group) => {
            const Icon = group.icon;
            const SecondaryIcon = group.secondaryIcon;

            return (
            <div
              key={group.title}
              className="portfolio-reveal group rounded-3xl border border-[#BDC3C7]/30 bg-white/70 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#b8b2b0] hover:shadow-xl hover:shadow-[#b8b2b0]/10 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-[#b8b2b0]"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#151621] text-white dark:bg-white dark:text-[#151621] shadow-md group-hover:bg-[#b8b2b0] group-hover:text-white transition-colors">
                  <Icon size={22} />
                </div>
                {SecondaryIcon && (
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#b8b2b0]/15 text-[#b8b2b0]">
                    <SecondaryIcon size={18} />
                  </div>
                )}
              </div>

              <h3 className="text-[#151621] dark:text-white font-black text-base uppercase tracking-widest mb-4">
                {group.title}
              </h3>

              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-slate-100 dark:bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-gray-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HobbiesSection;
