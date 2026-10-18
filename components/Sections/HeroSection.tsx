import React, { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scroller } from 'react-scroll';
import { PERSONAL_INFO, REALIZED_PROJECTS, TRANSLATIONS } from '../../constants';
import { Language } from '../../types';
import profilePicture from '../../assets/pro_picture.webp';
import { MotionWords } from '../Shared/StyledForms';
import { cancelActiveScroll, runWithNativeSmoothDisabled } from '../../utils/scrollMotion';

gsap.registerPlugin(ScrollTrigger);

const HeroSection: React.FC<{ language: Language; isActive: boolean }> = ({ language, isActive }) => {
  const [selected, setSelected] = useState(1);
  const root = useRef<HTMLElement>(null);
  const hasEntered = useRef(false);
  const projects = REALIZED_PROJECTS[language];
  const project = projects[selected];
  const t = TRANSLATIONS[language];

  useLayoutEffect(() => {
    if (!isActive) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      if (hasEntered.current) return;
      hasEntered.current = true;
      gsap.from('.cinema-intro-item', {
        opacity: 0, y: 24, duration: 0.65, stagger: index => Math.min(index * 0.06, 0.24), ease: 'power3.out', clearProps: 'opacity,transform',
      });
      gsap.from('.cinema-name .cinema-word', {
        yPercent: 100, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out', clearProps: 'opacity,transform',
      });
    }, root);
    media.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.to('.cinema-stage-art', {
        y: -35, ease: 'none',
        scrollTrigger: { trigger: '.cinema-stage', start: 'top 40%', end: 'bottom top', scrub: 0.6 },
      });
    }, root);
    media.add('(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const visual = root.current?.querySelector<HTMLElement>('.cinema-stage-visual');
      const panel = root.current?.querySelector<HTMLElement>('.cinema-stage-panel');
      if (!visual || !panel) return;
      gsap.set(visual, { perspective: 1000 });
      const rotateX = gsap.quickTo(panel, 'rotationX', { duration: 0.65, ease: 'power3.out' });
      const rotateY = gsap.quickTo(panel, 'rotationY', { duration: 0.65, ease: 'power3.out' });
      const move = (event: PointerEvent) => {
        const rect = visual.getBoundingClientRect();
        rotateX((0.5 - (event.clientY - rect.top) / rect.height) * 5);
        rotateY(((event.clientX - rect.left) / rect.width - 0.5) * 7);
      };
      const reset = () => { rotateX(0); rotateY(0); };
      visual.addEventListener('pointermove', move);
      visual.addEventListener('pointerleave', reset);
      return () => { visual.removeEventListener('pointermove', move); visual.removeEventListener('pointerleave', reset); };
    }, root);
    media.add('(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const button = root.current?.querySelector<HTMLElement>('.cinema-actions .cinema-button');
      const content = button?.querySelector<HTMLElement>('.cinema-button-content');
      if (!button || !content) return;
      const x = gsap.quickTo(content, 'x', { duration: 0.25, ease: 'power3.out' });
      const y = gsap.quickTo(content, 'y', { duration: 0.25, ease: 'power3.out' });
      const move = (event: PointerEvent) => {
        if (button.matches(':focus-visible')) return;
        const rect = button.getBoundingClientRect();
        x(((event.clientX - rect.left) / rect.width - 0.5) * 6);
        y(((event.clientY - rect.top) / rect.height - 0.5) * 6);
      };
      const reset = () => { x(0); y(0); };
      button.addEventListener('pointermove', move);
      button.addEventListener('pointerleave', reset);
      button.addEventListener('focus', reset);
      return () => {
        button.removeEventListener('pointermove', move);
        button.removeEventListener('pointerleave', reset);
        button.removeEventListener('focus', reset);
      };
    }, root);
    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 350);
    return () => { window.clearTimeout(refresh); media.revert(); };
  }, [isActive]);

  const goToContact = (event: React.MouseEvent) => {
    event.preventDefault();
    cancelActiveScroll();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    runWithNativeSmoothDisabled(() => {
      scroller.scrollTo('contact', { smooth: reduced ? false : 'easeInOutCubic', duration: reduced ? 0 : 760, offset: -90 });
    }, reduced ? 0 : 880);
  };

  const changeProject = (step: number) => setSelected(current => (current + step + projects.length) % projects.length);

  return (
    <section id="home" ref={root} className="cinema-hero">
      <div className="cinema-intro">
        <div className="cinema-portrait cinema-intro-item">
          <img src={profilePicture} alt={PERSONAL_INFO.fullName} width="160" height="160" fetchPriority="high" />
          <span className="cinema-portrait-index" aria-hidden="true">JC — 01</span>
        </div>
        <div className="cinema-identity">
          <p className="cinema-eyebrow cinema-intro-item">RANDRIAMAHERY <span>— {language === 'fr' ? 'Portfolio personnel' : 'Personal portfolio'}</span></p>
          <h1 className="cinema-name"><MotionWords>JASON CHRIS</MotionWords><span className="sr-only"> — Randriamahery</span></h1>
          <div className="cinema-intro-bottom cinema-intro-item">
            <div>
              <p className="cinema-role">{language === 'fr' ? 'Développeur full-stack' : 'Full-stack developer'}</p>
              <div className="cinema-actions">
                <Link to="/realisations" className="cinema-button"><span className="cinema-button-content">{t.hero.viewProjects}<ArrowUpRight size={17} /></span></Link>
                <a href="#contact" onClick={goToContact} className="cinema-text-link">{t.hero.contactMe}<ArrowRight size={16} /></a>
              </div>
            </div>
            <p className="cinema-tagline">{PERSONAL_INFO.tagline[language]}</p>
          </div>
        </div>
      </div>

      <div className="cinema-gallery-label cinema-intro-item">
        <span className="cinema-eyebrow">{language === 'fr' ? 'Une sélection de réalisations' : 'Selected work'}</span>
        <span className="cinema-eyebrow">01 — 03 <ArrowDown size={13} aria-hidden="true" /></span>
      </div>
      <div className="cinema-stage cinema-intro-item" aria-roledescription={language === 'fr' ? 'Galerie de projets' : 'Project gallery'}>
        <div className="cinema-stage-info" key={`info-${project.slug}`}>
          <span className="cinema-eyebrow cinema-scene-index">{String(selected + 1).padStart(2, '0')} <span className="cinema-rule" /></span>
          <h2>{project.title}</h2>
          <p className="cinema-eyebrow cinema-stage-type">{project.type}</p>
          <p className="cinema-stage-stack">{project.technologies.join(' · ')}</p>
          <p className="cinema-stage-description">{project.description}</p>
          <Link to={`/realisations?project=${project.slug}`} className="cinema-text-link">
            <span className="cinema-round-arrow"><ArrowUpRight size={18} /></span>
            {language === 'fr' ? 'Découvrir le projet' : 'Explore project'}
          </Link>
        </div>
        <Link to={`/realisations?project=${project.slug}`} className="cinema-stage-visual" aria-label={`${language === 'fr' ? 'Découvrir' : 'Explore'} ${project.title}`}>
          <div className="cinema-stage-panel">
            <span className="cinema-art-caption">{language === 'fr' ? 'Identité du projet' : 'Project identity'} <ArrowUpRight size={15} /></span>
            <div className="cinema-stage-art">
              <img key={project.slug} src={project.imageUrl} alt={project.title} width="480" height="480" />
            </div>
            <span className="cinema-art-bottom">{project.status}<span>{project.lastActivity}</span></span>
          </div>
          <span className="cinema-stage-number" aria-hidden="true">{String(selected + 1).padStart(2, '0')}</span>
        </Link>
      </div>
      <p className="sr-only" role="status">{project.title}</p>
      <div className="cinema-filmstrip cinema-intro-item" role="group" aria-label={language === 'fr' ? 'Choisir un projet' : 'Choose a project'}>
        <button className="cinema-arrow" onClick={() => changeProject(-1)} aria-label={language === 'fr' ? 'Projet précédent' : 'Previous project'}><ChevronLeft size={20} /></button>
        {projects.map((item, index) => (
          <button key={item.slug} className={`cinema-film-item ${selected === index ? 'is-selected' : ''}`} aria-pressed={selected === index} onClick={() => setSelected(index)}>
            <span>{String(index + 1).padStart(2, '0')}</span><span>{item.title}</span><ArrowUpRight size={16} />
          </button>
        ))}
        <button className="cinema-arrow" onClick={() => changeProject(1)} aria-label={language === 'fr' ? 'Projet suivant' : 'Next project'}><ChevronRight size={20} /></button>
      </div>
      <div className="cinema-gallery-footer"><span>{language === 'fr' ? 'Du besoin métier à l’interface.' : 'From business needs to interfaces.'}</span><a href="#about">{language === 'fr' ? 'La suite du parcours' : 'Continue exploring'} <ArrowDown size={14} /></a></div>
    </section>
  );
};

export default HeroSection;
