// src/types.ts

// --- GITHUB ---
export interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  homepage: string;
  stargazers_count: number;
  language: string;
  updated_at: string;
}

export interface GitHubUser {
  login: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  bio: string;
  html_url: string;
}

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
  githubUrl?: string;
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
    projects: string;
    contact: string;
    activite: string;
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
    githubProjects: string;
    hobbies: string;
    contact: string;
  };
  contact: {
    ready: string;
    sub: string;
    socials: string;
    cvText: string;
    downloadBtn: string;
  };
}