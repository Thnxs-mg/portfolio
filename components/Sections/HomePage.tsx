import React from 'react';
import HeroSection from './HeroSection';
import AboutSection from './AboutSection';
import SkillsSection from './SkillsSection';
import HobbiesSection from './HobbiesSection';
import ContactSection from './ContactSection';
import ActiviteGithub from './ActiviteGithub';
import { Language } from '../../types';

const HomePage: React.FC<{ language: Language }> = ({ language }) => {
  return (
    <>
      <HeroSection language={language} />
      <div className="space-y-0">
        <AboutSection language={language} />
        <SkillsSection language={language} />
        <ActiviteGithub language={language} />
        <HobbiesSection language={language} />
        <ContactSection language={language} />
      </div>
    </>
  );
};

export default HomePage;
