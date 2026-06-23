import { Experience, AcademicProject, Translations } from './types';
import { GENERATED_PROJECTS } from './data/generatedProjects';

export const GITHUB_USERNAME = 'Thnxs-mg';

export const PERSONAL_INFO = {
  fullName: 'RANDRIAMAHERY JASON CHRIS',
  title: {
    fr: 'DÉVELOPPEUR FULL-STACK JAVA / DJANGO – JUNIOR',
    en: 'JUNIOR JAVA / DJANGO FULL-STACK DEVELOPER'
  },
  tagline: {
    fr: 'Développement d’applications web fiables, d’API structurées et d’interfaces utiles, avec une attention particulière portée à la clarté et à l’expérience utilisateur.',
    en: 'Building reliable web applications, structured APIs, and useful interfaces with strong attention to clarity and user experience.'
  },
  phone: '+ 261 38 53 989 18',
  email: 'rd.jasonchris@gmail.com',
  address: 'Cité Canada M42 Parcelle 23/12',
  github: `https://github.com/${GITHUB_USERNAME}`,
  linkedin: 'https://www.linkedin.com/in/jason-randriamahery-419663261/',
};

// --- EXPÉRIENCES ---
export const EXPERIENCES: Record<'fr' | 'en', Experience[]> = {
  fr: [
    {
      title: 'Stage – Hôtel Blue',
      company: 'Hôtel Blue',
      period: '2025 - Aujourd\'hui',
      details: [
        'Technologies utilisées : Django REST Framework, React, TypeScript, PostgreSQL, Tailwind CSS.',
        'Système de planification interactif en temps réel, un moteur de réservation sans conflit, une facturation PDF automatisée et des tableaux de bord statistiques.',
        'Amélioration de la sécurité des revenus et réduction du temps de traitement à la réception.'
      ]
    }
  ],
  en: [
    {
      title: 'Internship – Hotel Blue',
      company: 'Hotel Blue',
      period: '2025 - Today',
      details: [
        'Technologies used: Django REST Framework, React, TypeScript, PostgreSQL, Tailwind CSS.',
        'Real-time interactive scheduling system, conflict-free booking engine, automated PDF invoicing and statistical dashboards.',
        'Revenue security improvement and reception processing time reduction.'
      ]
    }
  ]
};

// --- ANCIENNE LISTE (Utilisée dans la section "À Propos" si besoin) ---
export const ACADEMIC_PROJECTS: Record<'fr' | 'en', AcademicProject[]> = {
  fr: [
    {
      title: 'Application de Streaming (Sockets)',
      description: 'Application de diffusion vidéo/audio en temps réel utilisant des sockets réseau.'
    },
    {
      title: 'Gestion du module RH – Extension ERPNext',
      description: 'Extension du module RH existant dans ERPNext afin d’améliorer les fonctionnalités de gestion des ressources humaines.'
    },
    {
      title: 'Cryptomonnaie en ligne',
      description: 'Application mobile avec React Native et une application web avec Spring Boot, toutes deux connectées à Firebase pour les données en temps réel.'
    }
  ],
  en: [
    {
      title: 'Streaming App (Sockets)',
      description: 'Real-time video/audio broadcasting application using network sockets.'
    },
    {
      title: 'HR Module Management – ERPNext Extension',
      description: 'Extension of the existing HR module in ERPNext to improve human resource management functionalities.'
    },
    {
      title: 'Online Cryptocurrency',
      description: 'Mobile application with React Native and a web application with Spring Boot, both connected to Firebase for real-time data.'
    }
  ]
};

// --- PROJETS GÉNÉRÉS DEPUIS /home/thnxs/my_pc/project ---
export const REALIZED_PROJECTS = GENERATED_PROJECTS;

// --- EDUCATION ---
export const EDUCATION: Record<'fr' | 'en', any[]> = {
  fr: [
    {
      degree: 'Licence en informatique',
      school: 'IT University',
      details: ''
    },
    {
      degree: 'Diplôme d’études secondaires',
      school: '2022',
      details: ''
    }
  ],
  en: [
    {
      degree: 'Bachelor in Computer Science',
      school: 'IT University',
      details: ''
    },
    {
      degree: 'High School Diploma',
      school: '2022',
      details: ''
    }
  ]
};

// --- SKILLS ---
export const SKILLS = {
  backend: [
    { name: 'Java (Spring Boot)', level: 85 },
    { name: 'Python (Django)', level: 80 }
  ],
  frontend: [
    { name: 'React', level: 85 },
    { name: 'JavaScript', level: 90 }
  ],
  databases: [
    { name: 'PostgreSQL', level: 75 },
    { name: 'MySQL', level: 70 }
  ],
  languages: [
    { name: { fr: 'Français', en: 'French' }, level: 95 },
    { name: { fr: 'Anglais', en: 'English' }, level: 75 }
  ]
};

// --- HOBBIES ---
export const HOBBIES: Record<'fr' | 'en', string[]> = {
  fr: ['Guitare, chant, dessin, lecture', 'Cyclisme, volley-ball', 'Programmation, photographie'],
  en: ['Guitar, singing, drawing, reading', 'Cycling, volleyball', 'Programming, photography']
};

// --- TRANSLATIONS ---
export const TRANSLATIONS: Record<'fr' | 'en', Translations> = {
  fr: {
    nav: { home: 'Accueil', about: 'À Propos', skills: 'Compétences', projects: 'Projets', contact: 'Contact', activite: 'Activité GitHub' },
    hero: { viewProjects: 'Voir mes Projets', contactMe: 'Me contacter' },
    sections: {
      experience: 'Expérience professionnelle',
      academicProjects: 'Projets',
      education: 'Diplômes',
      skills: 'Compétences',
      githubProjects: 'Projets GitHub',
      hobbies: 'Loisirs',
      contact: 'Contact'
    },
    contact: {
      ready: 'Prêt à collaborer ?',
      sub: "Je suis actuellement à la recherche d'opportunités en tant que développeur Junior. N'hésitez pas à me contacter !",
      socials: 'Réseaux Sociaux',
      cvText: "Besoin d'un CV format PDF ?",
      downloadBtn: 'Télécharger mon CV'
    }
  },
  en: {
    nav: { home: 'Home', about: 'About', skills: 'Skills', projects: 'Projects', contact: 'Contact', activite: 'GitHub Activity' },
    hero: { viewProjects: 'View Projects', contactMe: 'Contact Me' },
    sections: {
      experience: 'Professional Experience',
      academicProjects: 'Projects',
      education: 'Diplomas',
      skills: 'Skills',
      githubProjects: 'GitHub Projects',
      hobbies: 'Hobbies',
      contact: 'Contact'
    },
    contact: {
      ready: 'Ready to collaborate?',
      sub: "I am currently looking for opportunities as a Junior Developer. Feel free to contact me!",
      socials: 'Social Networks',
      cvText: "Need a PDF resume?",
      downloadBtn: 'Download Resume'
    }
  }
};
