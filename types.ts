// src/types.ts

// --- COMPÉTENCES ---
export interface Skill {
  // Le nom peut être une simple chaîne OU un objet avec traductions (pour les langues)
  name: string | { fr: string; en: string };
  level: number; 
}

// --- EXPÉRIENCES ---
export interface Experience {
  title: string;
  company: string;
  period: string;
  details: string[];
}

// --- ANCIEN TYPE (Gardé pour compatibilité si nécessaire) ---
export interface AcademicProject {
  title: string;
  description: string;
}

// --- NOUVEAU TYPE : PROJETS RÉALISÉS (Pour la page AllProjectsPage) ---
export interface Project {
  title: string;
  description: string;
  fullDescription?: string;
  technologies: string[];
  category: 'professional' | 'personal' | 'academic';
  demoUrl?: string;
  imageUrl?: string; // <--- NOUVEAU CHAMP
}

// --- GLOBAL ---
export type Language = 'fr' | 'en';

export interface Translations {
  nav: {
    home: string;
    about: string;
    skills: string;
    hobbies: string;
    projects: string;
    contact: string;
  };
  hero: {
    viewProjects: string;
    contactMe: string;
  };
  sections: {
    experience: string;
    academicProjects: string;
    education: string;
    skills: string;
    hobbies: string;
    contact: string;
  };
  contact: {
    ready: string;
    sub: string;
    cvText: string;
    downloadBtn: string;
  };
}
