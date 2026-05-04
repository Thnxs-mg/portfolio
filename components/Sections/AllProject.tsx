import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { REALIZED_PROJECTS } from '../../constants';
import { Language, Project } from '../../types';
import { ArrowLeft, Briefcase, GraduationCap, User, X, Eye, Rocket } from 'lucide-react';

interface AllProjectsPageProps {
    language: Language;
}

const AllProjectsPage: React.FC<AllProjectsPageProps> = ({ language }) => {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    useEffect(() => {
        if (selectedProject) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedProject]);

    const projects = REALIZED_PROJECTS[language];

    const getCategoryStyle = (category: string) => {
        switch (category) {
            case 'professional': return { icon: <Briefcase size={14} />, bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-300', label: language === 'fr' ? 'Professionnel' : 'Professional' };
            case 'academic': return { icon: <GraduationCap size={14} />, bg: 'bg-purple-100 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-300', label: language === 'fr' ? 'Académique' : 'Academic' };
            default: return { icon: <User size={14} />, bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-300', label: language === 'fr' ? 'Personnel' : 'Personal' };
        }
    };

    return (
        <div className="min-h-screen pt-28 pb-12 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">

                {/* --- Header --- */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 relative">
                    <Link to="/" className="group flex items-center gap-2 text-[#151621] dark:text-white font-black uppercase tracking-widest text-xs hover:text-[#b8b2b0] transition-colors">
                        <div className="p-2 bg-white dark:bg-white/10 rounded-full group-hover:bg-[#b8b2b0] group-hover:text-white transition-all shadow-md border border-slate-100 dark:border-white/5"><ArrowLeft size={18} /></div>
                        {language === 'fr' ? "Retour" : "Back"}
                    </Link>
                    <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2">
                        <h1 className="text-3xl sm:text-4xl font-black text-[#151621] dark:text-white">{language === 'fr' ? "Mes Réalisations" : "My Work"}</h1>
                        <span className="block h-1.5 w-24 bg-[#b8b2b0] mx-auto mt-4 rounded-full"></span>
                    </div>
                    <div className="hidden md:block w-24"></div>
                </div>

                {/* --- RÉSULTATS --- */}
                {projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project, idx) => {
                            const catStyle = getCategoryStyle(project.category);
                            return (
                                <article key={idx} onClick={() => setSelectedProject(project)} className="group cursor-pointer bg-white dark:bg-[#151621] rounded-[2rem] overflow-hidden [clip-path:inset(0_round_2rem)] shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 dark:border-white/5 flex flex-col h-full animate-in fade-in zoom-in-95 duration-500 transform-gpu">
                                    <div className="relative h-48 w-full overflow-hidden rounded-t-[2rem] bg-gray-200 dark:bg-gray-800">
                                        {project.imageUrl ? (
                                            <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400"><Briefcase size={32} /></div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2"><Eye size={16} /> {language === 'fr' ? 'Détails' : 'Details'}</span></div>
                                        <div className="absolute top-4 left-4"><div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/95 backdrop-blur shadow-sm ${catStyle.text}`}>{catStyle.icon} {catStyle.label}</div></div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <h3 className="text-xl font-black text-[#151621] dark:text-white mb-3 leading-tight group-hover:text-[#b8b2b0] transition-colors">{project.title}</h3>
                                        <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">{project.description}</p>
                                        <div className="mt-auto flex flex-wrap gap-2">{project.technologies.slice(0, 3).map((tech, i) => (<span key={i} className="px-2 py-1 bg-slate-100 dark:bg-white/10 text-[#151621] dark:text-gray-300 text-[10px] font-bold uppercase tracking-widest rounded-md">{tech}</span>))}{project.technologies.length > 3 && <span className="px-2 py-1 text-slate-400 text-[10px] font-bold">+{project.technologies.length - 3}</span>}</div>
                                    </div>
                                    {project.demoUrl && <div className="px-6 pb-6 pt-0 flex gap-3 mt-auto"><Rocket size={16} className="text-[#b8b2b0]" /></div>}
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 animate-in fade-in">
                        <h3 className="text-xl font-black text-[#151621] dark:text-white mb-2">{language === 'fr' ? 'Aucun projet trouvé' : 'No projects found'}</h3>
                        <p className="text-slate-500 dark:text-gray-400 mb-6">{language === 'fr' ? 'Aucune réalisation disponible pour le moment.' : 'No work available yet.'}</p>
                    </div>
                )}


                {/* --- MODAL DE DÉTAILS PROJET --- */}
                {selectedProject && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer" onClick={() => setSelectedProject(null)}></div>
                        <div className="relative bg-white dark:bg-[#1e212b] w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
                            <button onClick={() => setSelectedProject(null)} className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"><X size={20} /></button>
                             <div className="h-56 sm:h-72 w-full shrink-0 relative bg-gray-200 dark:bg-gray-800">
                                {selectedProject.imageUrl && <img src={selectedProject.imageUrl} alt={selectedProject.title} className="w-full h-full object-cover" />}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                                <div className="absolute bottom-6 left-6 sm:left-8 right-6">
                                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 shadow-sm">{selectedProject.title}</h2>
                                    {(() => {
                                        const style = getCategoryStyle(selectedProject.category);
                                        return <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-md border border-white/20`}>{style.icon} {style.label}</span>;
                                    })()}
                                </div>
                            </div>
                            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
                                <div className="mb-8">
                                    <h3 className="text-xs font-black text-[#b8b2b0] uppercase tracking-widest mb-3 flex items-center gap-2">{language === 'fr' ? 'À propos' : 'About'}<span className="h-px bg-[#b8b2b0]/20 flex-grow"></span></h3>
                                    <p className="text-slate-600 dark:text-gray-300 text-base leading-relaxed">{selectedProject.fullDescription || selectedProject.description}</p>
                                </div>
                                <div className="mb-8">
                                    <h3 className="text-xs font-black text-[#b8b2b0] uppercase tracking-widest mb-3">{language === 'fr' ? 'Compétences' : 'Skills'}</h3>
                                    <div className="flex flex-wrap gap-2">{selectedProject.technologies.map((tech, i) => (<span key={i} className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-[#151621] dark:text-white text-xs font-bold rounded-lg border border-slate-200 dark:border-white/10">{tech}</span>))}</div>
                                </div>
                                {selectedProject.demoUrl && (
                                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100 dark:border-white/10 mt-auto">
                                       <a href={selectedProject.demoUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#b8b2b0] text-white font-black uppercase tracking-widest text-xs hover:bg-[#419da8] transition-colors shadow-lg shadow-[#b8b2b0]/30 hover:shadow-xl hover:-translate-y-0.5"><Rocket size={18} /> {language === 'fr' ? 'Voir le projet' : 'Live Demo'}</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AllProjectsPage;
