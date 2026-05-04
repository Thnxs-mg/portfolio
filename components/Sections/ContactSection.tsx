import React from 'react';
import { Phone, Mail, MapPin, Github, Linkedin, ArrowRight, Download } from 'lucide-react';
import { PERSONAL_INFO, TRANSLATIONS } from '../../constants';
import { Language } from '../../types';
import { CapsuleDivider } from '../Shared/StyledForms';

interface ContactSectionProps {
  language: Language;
}

const CV_LINKS: Record<Language, string> = {
  fr: "https://raw.githubusercontent.com/RdjcMada/jason-chris-portfolio/main/assets/Cv_FRS.pdf",
  en: "https://raw.githubusercontent.com/RdjcMada/jason-chris-portfolio/main/assets/Cv_ENG.pdf" // Assure-toi que ce fichier existe aussi
};

const ContactItem: React.FC<{ icon: React.ReactNode; label: string; value: string; href?: string }> = ({ icon, label, value, href }) => (
  <div className="flex items-start gap-5">
    {/* L'icône reste fixe */}
    <div className="p-3 bg-[#BDC3C7]/10 dark:bg-white/10 text-[#2D3243] dark:text-white rounded-xl shrink-0">
      {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
    </div>
    <div>
      <p className="text-[10px] font-black text-[#52B2BF] uppercase tracking-widest mb-1">
        {label}
      </p>
      {href ? (
        <a 
          href={href} 
          className="block text-[#2D3243] dark:text-white text-base font-bold hover:text-[#52B2BF] dark:hover:text-[#52B2BF] transition-colors leading-tight"
        >
          {value}
        </a>
      ) : (
        <p className="text-[#2D3243] dark:text-white text-base font-bold leading-tight">
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
        <div className="bg-white dark:bg-[#2D3243] rounded-[3rem] shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden flex flex-col lg:flex-row relative group">

          {/* --- PARTIE GAUCHE : INFOS --- */}
          <div className="lg:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2D3243] dark:text-white mb-6 leading-[1.1]">
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
              <ContactItem
                icon={<MapPin />}
                label={language === 'fr' ? "Adresse" : "Address"}
                value={PERSONAL_INFO.address}
              />
            </div>
          </div>

          {/* --- PARTIE DROITE : RÉSEAUX --- */}
          <div className="lg:w-5/12 bg-slate-50 dark:bg-black/20 p-8 sm:p-12 lg:p-16 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-white/5 relative">

            <div className="absolute top-0 right-0 w-64 h-64 bg-[#52B2BF]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <h3 className="text-xl font-black text-[#2D3243] dark:text-white mb-8 uppercase tracking-widest flex items-center gap-3">
              <span className="w-8 h-1 bg-[#52B2BF] rounded-full"></span>
              {t.contact.socials}
            </h3>

            <div className="grid grid-cols-1 gap-4 mb-8">
              <a
                href={PERSONAL_INFO.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#2D3243] border border-slate-200 dark:border-white/10 hover:border-[#52B2BF] hover:shadow-lg hover:shadow-[#52B2BF]/10 transition-all duration-300 group/btn"
              >
                <div className="p-2 bg-[#2D3243] text-white rounded-lg">
                  <Github size={24} />
                </div>
                <span className="font-bold text-[#2D3243] dark:text-white text-sm uppercase tracking-wide group-hover/btn:text-[#52B2BF] transition-colors">GitHub Profile</span>
                <ArrowRight size={18} className="ml-auto text-slate-300 group-hover/btn:text-[#52B2BF] group-hover/btn:translate-x-1 transition-all" />
              </a>

              <a
                href={PERSONAL_INFO.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#2D3243] border border-slate-200 dark:border-white/10 hover:border-[#0077B5] hover:shadow-lg hover:shadow-[#0077B5]/10 transition-all duration-300 group/btn"
              >
                <div className="p-2 bg-[#0077B5] text-white rounded-lg">
                  <Linkedin size={24} />
                </div>
                <span className="font-bold text-[#2D3243] dark:text-white text-sm uppercase tracking-wide group-hover/btn:text-[#0077B5] transition-colors">LinkedIn Profile</span>
                <ArrowRight size={18} className="ml-auto text-slate-300 group-hover/btn:text-[#0077B5] group-hover/btn:translate-x-1 transition-all" />
              </a>
            </div>

            <div className="pt-8 border-t border-slate-200 dark:border-white/10 mt-auto">
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
                className="w-full bg-[#2D3243] dark:bg-white text-white dark:text-[#2D3243] py-4 rounded-xl font-black flex items-center justify-center gap-3 hover:bg-[#52B2BF] dark:hover:bg-[#52B2BF] dark:hover:text-white transition-all shadow-xl hover:shadow-[#52B2BF]/20 uppercase tracking-widest text-sm transform hover:-translate-y-1 cursor-pointer"
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