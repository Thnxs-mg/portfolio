import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { EDUCATION, TRANSLATIONS } from '../../constants';
import { Language } from '../../types';
import { CapsuleDivider, MotionWords } from '../Shared/StyledForms';
import { useRevealOnScroll } from '../../hooks/useRevealOnScroll';

const AboutSection: React.FC<{ language: Language }> = ({ language }) => {
  const ref = useRevealOnScroll<HTMLElement>();
  return (
    <section ref={ref} id="about">
      <CapsuleDivider className="portfolio-reveal mb-8">{language === 'fr' ? 'Le parcours' : 'The background'} / 02</CapsuleDivider>
      <h2 className="cinema-about-heading portfolio-reveal"><MotionWords>{language === 'fr' ? 'La technique au service des usages.' : 'Engineering for everyday use.'}</MotionWords></h2>
      <h3 className="cinema-eyebrow portfolio-reveal mb-6">{TRANSLATIONS[language].sections.education}</h3>
      <div className="cinema-education">
        {EDUCATION[language].map((education, index) => (
          <div key={index} className="cinema-education-item portfolio-reveal">
            <h3>{education.degree}</h3><p>{education.school}</p>
            {education.details && <p>{education.details}</p>}
          </div>
        ))}
      </div>
      <div className="cinema-about-link portfolio-reveal">
        <div><h3 className="cinema-eyebrow mb-3">{language === 'fr' ? 'Curieux de voir mes réalisations ?' : "Curious to see what I've built?"}</h3>
          <p>{language === 'fr' ? "Découvrez l'ensemble de mes projets académiques et personnels, ainsi que mon activité récente sur GitHub." : 'Discover all my academic and personal projects, as well as my recent activity on GitHub.'}</p>
        </div>
        <Link to="/realisations" className="cinema-text-link">{language === 'fr' ? 'Toutes les réalisations' : 'All projects'}<ArrowUpRight size={20} /></Link>
      </div>
    </section>
  );
};
export default AboutSection;
