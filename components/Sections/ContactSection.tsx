import React from 'react';
import { Phone, Mail, Download } from 'lucide-react';
import { PERSONAL_INFO, TRANSLATIONS } from '../../constants';
import { Language } from '../../types';
import { CapsuleDivider } from '../Shared/StyledForms';

interface ContactSectionProps {
  language: Language;
}

const CV_LINKS: Record<Language, string> = {
  fr: '/Cv_FRS.pdf',
  en: '/Cv_ENG.pdf',
};

const ContactItem: React.FC<{ icon: React.ReactNode; label: string; value: string; href?: string }> = ({ icon, label, value, href }) => (
  <div className="flex items-start gap-5">
    {/* L'icône reste fixe */}
    <div className="p-3 bg-[#BDC3C7]/10 dark:bg-white/10 text-[#151621] dark:text-white rounded-xl shrink-0">
      {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
    </div>
    <div>
      <p className="text-[10px] font-black text-[#b8b2b0] uppercase tracking-widest mb-1">
        {label}
      </p>
      {href ? (
        <a 
          href={href} 
          className="block text-[#151621] dark:text-white text-base font-bold hover:text-[#b8b2b0] dark:hover:text-[#b8b2b0] transition-colors leading-tight"
        >
          {value}
        </a>
      ) : (
        <p className="text-[#151621] dark:text-white text-base font-bold leading-tight">
          {value}
        </p>
      )}
    </div>
  </div>
);

const ContactSection: React.FC<ContactSectionProps> = ({ language }) => {
  const t = TRANSLATIONS[language];

  return (
    <section id="contact" className="sm:py-24 px-4 sm:px-6 bg-[#BDC3C7]/5 dark:bg-white/[0.01]">
      <div className="max-w-5xl mx-auto">

        <CapsuleDivider className="mb-8 w-fit mx-auto md:mx-0">
          {t.sections.contact}
        </CapsuleDivider>

        {/* --- LE GRAND CONTENEUR UNIFIÉ --- */}
        <div className="bg-white dark:bg-[#151621] rounded-[3rem] shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden flex flex-col lg:flex-row relative group">

          {/* --- PARTIE GAUCHE : INFOS --- */}
          <div className="lg:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#151621] dark:text-white mb-6 leading-[1.1]">
              {t.contact.ready}
            </h2>
            <p className="text-slate-600 dark:text-gray-400 mb-10 text-lg leading-relaxed max-w-md">
              {t.contact.sub}
            </p>

            <div className="space-y-6">
              <ContactItem
                icon={<Phone />}
                label={language === 'fr' ? "Téléphone" : "Phone"}
                value={PERSONAL_INFO.phone}
                href={`tel:${PERSONAL_INFO.phone.replace(/\s/g, '')}`}
              />
              <ContactItem
                icon={<Mail />}
                label="Email"
                value={PERSONAL_INFO.email}
                href={`mailto:${PERSONAL_INFO.email}`}
              />
            </div>
          </div>

          {/* --- PARTIE DROITE : CV --- */}
          <div className="lg:w-5/12 bg-slate-50 dark:bg-black/20 p-8 sm:p-12 lg:p-16 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-white/5 relative">

            <div className="absolute top-0 right-0 w-64 h-64 bg-[#b8b2b0]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">
                {t.contact.cvText}
              </p>
              
              <a 
                href={CV_LINKS[language]} 
                target="_blank"
                rel="noopener noreferrer"
                // L'attribut download suggère au navigateur de télécharger, 
                // mais avec un lien externe, le navigateur ouvrira souvent le PDF dans un nouvel onglet
                // (ce qui est le comportement standard sécurisé pour les PDF).
                className="w-full bg-[#151621] dark:bg-white text-white dark:text-[#151621] py-4 rounded-xl font-black flex items-center justify-center gap-3 hover:bg-[#b8b2b0] dark:hover:bg-[#b8b2b0] dark:hover:text-white transition-all shadow-xl hover:shadow-[#b8b2b0]/20 uppercase tracking-widest text-sm transform hover:-translate-y-1 cursor-pointer"
              >
                {t.contact.downloadBtn}
                <Download size={18} />
              </a>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default ContactSection;
