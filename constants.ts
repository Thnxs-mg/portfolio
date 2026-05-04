import { Experience, AcademicProject, Project, Translations } from './types';
import arogneLogo from './assets/project_icon/arogne.jpeg';
import clayChrisLogo from './assets/project_icon/claychris.jpg';
import gozoLogo from './assets/project_icon/gozo.jpg';

export const PERSONAL_INFO = {
  fullName: 'RANDRIAMAHERY JASON CHRIS',
  title: {
    fr: 'COMMUNITY MANAGER JUNIOR',
    en: 'JUNIOR COMMUNITY MANAGER'
  },
  tagline: {
    fr: "Expérience dans la gestion de pages de marques, la création de contenu et le développement de l’image digitale.",
    en: 'Experience managing brand pages, creating content, and developing digital brand image.'
  },
  phone: '+ 261 38 53 989 18',
  email: 'rd.jasonchris@gmail.com',
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

// --- NOUVELLE LISTE DÉTAILLÉE (Utilisée dans AllProjectsPage) ---
export const REALIZED_PROJECTS: Record<'fr' | 'en', Project[]> = {
  fr: [
    {
      title: 'Arogné (2026)',
      description: 'Création de contenu, gestion de pages et planification éditoriale.',
      fullDescription: 'Gestion de la page Facebook, création de contenu et planification éditoriale. La page a été lancée au mois d’avril, puis une approche plus structurée et professionnelle a été mise en place en mai afin de gérer l’intégralité de la présence digitale.',
      technologies: ['Facebook', 'Création de contenu', 'Planification éditoriale', 'Gestion de page'],
      category: 'professional',
      imageUrl: arogneLogo,
    },
    {
      title: 'Gozo (2024)',
      description: 'Punch, rhum arrangé, publications et relation client.',
      fullDescription: 'Participation à la création de certaines publications, conception d’affiches publicitaires et gestion des réponses aux clients pour la marque Gozo, spécialisée dans le punch et le rhum arrangé.',
      technologies: ['Publications', 'Affiches publicitaires', 'Relation client', 'Réseaux sociaux'],
      category: 'professional',
      imageUrl: gozoLogo,
    },
    {
      title: 'ClayChris (2023)',
      description: 'Création de publications et d’affiches publicitaires.',
      fullDescription: 'Participation à la création de certaines publications et conception d’affiches publicitaires pour la communication de ClayChris.',
      technologies: ['Création visuelle', 'Publications', 'Affiches publicitaires'],
      category: 'professional',
      imageUrl: clayChrisLogo,
    }
  ],
  en: [
    {
      title: 'Arogné (2026)',
      description: 'Content creation, page management, and editorial planning.',
      fullDescription: 'Facebook page management, content creation, and editorial planning. The page was started in April, then a more structured and professional approach was put in place in May to manage the full digital presence.',
      technologies: ['Facebook', 'Content creation', 'Editorial planning', 'Page management'],
      category: 'professional',
      imageUrl: arogneLogo,
    },
    {
      title: 'Gozo (2024)',
      description: 'Punch, infused rum, posts, and customer replies.',
      fullDescription: 'Created selected posts, designed advertising posters, and handled customer replies for Gozo, a brand focused on punch and infused rum.',
      technologies: ['Posts', 'Advertising posters', 'Customer relations', 'Social media'],
      category: 'professional',
      imageUrl: gozoLogo,
    },
    {
      title: 'ClayChris (2023)',
      description: 'Post creation and advertising poster design.',
      fullDescription: 'Created selected posts and designed advertising posters for ClayChris communication materials.',
      technologies: ['Visual creation', 'Posts', 'Advertising posters'],
      category: 'professional',
      imageUrl: clayChrisLogo,
    }
  ]
};

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
    nav: { home: 'Accueil', about: 'À Propos', skills: 'Compétences', hobbies: 'Loisirs', projects: 'Projets', contact: 'Contact' },
    hero: { viewProjects: 'Voir mes réalisations', contactMe: 'Me contacter' },
    sections: {
      experience: 'Expérience professionnelle',
      academicProjects: 'Projets',
      education: 'Diplômes',
      skills: 'Compétences',
      hobbies: 'Loisirs',
      contact: 'Contact'
    },
    contact: {
      ready: 'Prêt à collaborer ?',
      sub: "Je suis actuellement à la recherche d'opportunités en tant que développeur Junior. N'hésitez pas à me contacter !",
      cvText: "Besoin d'un CV format PDF ?",
      downloadBtn: 'Télécharger mon CV'
    }
  },
  en: {
    nav: { home: 'Home', about: 'About', skills: 'Skills', hobbies: 'Hobbies', projects: 'Projects', contact: 'Contact' },
    hero: { viewProjects: 'View My Work', contactMe: 'Contact Me' },
    sections: {
      experience: 'Professional Experience',
      academicProjects: 'Projects',
      education: 'Diplomas',
      skills: 'Skills',
      hobbies: 'Hobbies',
      contact: 'Contact'
    },
    contact: {
      ready: 'Ready to collaborate?',
      sub: "I am currently looking for opportunities as a Junior Developer. Feel free to contact me!",
      cvText: "Need a PDF resume?",
      downloadBtn: 'Download Resume'
    }
  }
};
