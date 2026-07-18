import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../types';
import { ArrowLeft, Github, Briefcase, GraduationCap, User, Rocket, Filter, Check, Activity, CalendarDays, ShieldCheck, Sparkles, Eye, FolderGit2, X } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface ProjectCardProps {
  project: Project;
  language: Language;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, language }) => {
  const t = TRANSLATIONS[language];
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'professional':
        return { icon: <Briefcase size={14} />, bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-300', label: language === 'fr' ? 'Professionnel' : 'Professional' };
      case 'academic':
        return { icon: <GraduationCap size={14} />, bg: 'bg-purple-100 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-300', label: language === 'fr' ? 'Académique' : 'Academic' };
      default:
        return { icon: <User size={14} />, bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-300', label: language === 'fr' ? 'Personnel' : 'Personal' };
    }
  };

  const catStyle = getCategoryStyle(project.category);

  return (
    <Link
      to={{
        pathname: `/realisations/${project.slug || project.title.toLowerCase().replace(/\s+/g, '-')}`,
        // you could pass state if needed
      }}
      className="group cursor-pointer bg-white dark:bg-[#151621] rounded-[1.75rem] overflow-hidden shadow-[0_18px_50px_rgba(15,23,42,0.08)] hover:shadow-[0_30px_80px_rgba(184,178,176,0.20)] hover:-translate-y-2 transition-all duration-500 border border-slate-100 dark:border-white/5 flex flex-col h-full transform-gpu"
    >
      <div className="relative h-48 w-full overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(184,178,176,0.24),transparent_38%),linear-gradient(135deg,#f8fafc,#eef2f7)] dark:bg-[radial-gradient(circle_at_top_left,rgba(184,178,176,0.16),transparent_42%),linear-gradient(135deg,#1e212b,#11131b)]">
        {project.imageUrl ? (
          <img src={project.imageUrl} alt={project.title} className="w-full h-full object-contain p-8 transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400"><Briefcase size={32} /></div>
        )}
        <div className="absolute inset-0 bg-[#151621]/55 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"><span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2"><Eye size={16} /> {language === 'fr' ? 'Détails' : 'Details'}</span></div>
        <div className="absolute top-4 left-4"><div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/95 backdrop-blur shadow-sm ${catStyle.text}`}>{catStyle.icon} {catStyle.label}</div></div>
        {project.status && <div className="absolute top-4 right-4 max-w-[48%] truncate rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600 shadow-sm backdrop-blur dark:bg-[#151621]/85 dark:text-slate-200">{project.status}</div>}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        {project.type && <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#b8b2b0]"><Sparkles size={13} /> {project.type}</div>}
        <h3 className="text-xl font-black text-[#151621] dark:text-white mb-3 leading-tight group-hover:text-[#b8b2b0] transition-colors">{project.title}</h3>
        <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed mb-5 line-clamp-3">{project.description}</p>
        {project.features && (
          <div className="mb-6 space-y-2">
            {project.features.slice(0, 2).map((feature) => (
              <div key={feature} className="flex items-start gap-2 text-xs text-slate-500 dark:text-gray-400">
                <ShieldCheck size={14} className="mt-0.5 shrink-0 text-[#b8b2b0]" />
                <span className="line-clamp-1">{feature}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-auto flex flex-wrap gap-2">
          {/* Compute main technologies by category */}
          {(() => {
            const backendSet = new Set(['Django', 'PostgreSQL', 'Express', 'Prisma', 'Node.js', 'Spring Boot', 'Python', 'Java']);
            const frontendSet = new Set(['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS']);
            const deploymentSet = new Set(['Render', 'Neon', 'AWS', 'Heroku', 'Vercel', 'Netlify']);

            const backend: string[] = [];
            const frontend: string[] = [];
            const deployment: string[] = [];

            project.technologies.forEach(tech => {
              if (backendSet.has(tech)) backend.push(tech);
              else if (frontendSet.has(tech)) frontend.push(tech);
              else if (deploymentSet.has(tech)) deployment.push(tech);
              // ignore other technologies
            });

            const t = TRANSLATIONS[language];
            const backendTitle = language === 'fr' ? 'Backend' : 'Backend';
            const frontendTitle = language === 'fr' ? 'Frontend' : 'Frontend';
            const deployTitle = language === 'fr' ? 'Déploiement' : 'Deployment';

            return (
              <>
                {backend.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-wider">{backendTitle}</span>
                    {backend.map((tech, idx) => (
                      <span key={idx} className="px-2 py-1 bg-slate-100 dark:bg-white/10 text-[#151621] dark:text-gray-300 text-[10px] font-bold uppercase tracking-widest rounded-md">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                {frontend.length > 0 && (
                  <div className="flex flex-col gap-1 ml-4">
                    <span className="text-xs font-bold uppercase tracking-wider">{frontendTitle}</span>
                    {frontend.map((tech, idx) => (
                      <span key={idx} className="px-2 py-1 bg-slate-100 dark:bg-white/10 text-[#151621] dark:text-gray-300 text-[10px] font-bold uppercase tracking-widest rounded-md">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                {deployment.length > 0 && (
                  <div className="flex flex-col gap-1 ml-4">
                    <span className="text-xs font-bold uppercase tracking-wider">{deployTitle}</span>
                    {deployment.map((tech, idx) => (
                      <span key={idx} className="px-2 py-1 bg-slate-100 dark:bg-white/10 text-[#151621] dark:text-gray-300 text-[10px] font-bold uppercase tracking-widest rounded-md">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
      <div className="px-6 pb-6 pt-0 flex items-center justify-between gap-3 mt-auto text-[11px] font-bold text-slate-400">
        <span className="flex items-center gap-1.5"><CalendarDays size={14} /> {project.lastActivity || (language === 'fr' ? 'Analysé' : 'Analyzed')}</span>
        <span className="flex items-center gap-2">{project.githubUrl && <Github size={16} />}{project.demoUrl && <Rocket size={16} className="text-[#b8b2b0]" />}</span>
      </div>
    </Link>
  );
};

export default ProjectCard;
