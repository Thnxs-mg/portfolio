import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { REALIZED_PROJECTS, TRANSLATIONS } from '../../constants';
import { Language, Project } from '../../types';
import { ArrowLeft, Github, Briefcase, GraduationCap, User, X, Eye, Rocket, Filter, Check, Activity, CalendarDays, FolderGit2, ShieldCheck, Sparkles } from 'lucide-react';

interface AllProjectsPageProps {
    language: Language;
}

const AllProjectsPage: React.FC<AllProjectsPageProps> = ({ language }) => {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    
    // --- ÉTATS POUR LES FILTRES (MULTI-SELECTION) ---
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    // Tableaux pour stocker plusieurs valeurs
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]); 
    const [selectedTechs, setSelectedTechs] = useState<string[]>([]);

    useEffect(() => {
        const isLocked = selectedProject !== null || isFilterOpen;
        if (isLocked) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            // Différer la remise à zéro pour ne pas flusher le DOM
            // de façon synchrone pendant l'animation de sortie de page.
            requestAnimationFrame(() => {
                document.body.style.overflow = '';
            });
        };
    }, [selectedProject, isFilterOpen]);

    const t = TRANSLATIONS[language];
    const projects = REALIZED_PROJECTS[language];

    // 1. Récupérer toutes les technologies uniques
    const allTechnologies = useMemo(() => {
        const techs = new Set<string>();
        projects.forEach(p => p.technologies.forEach(t => techs.add(t)));
        return Array.from(techs).sort();
    }, [projects]);

    // 2. LOGIQUE DE FILTRAGE MULTI-CRITÈRES
    const filteredProjects = projects.filter(project => {
        // Catégorie : Si aucune sélectionnée (tableau vide) => Tout montrer. Sinon, doit être dans la liste.
        const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(project.category);
        
        // Tech : Si aucune sélectionnée => Tout montrer. Sinon, le projet doit avoir au moins une des techs sélectionnées.
        const matchTech = selectedTechs.length === 0 || project.technologies.some(t => selectedTechs.includes(t));
        
        return matchCategory && matchTech;
    });

    // Helper pour ajouter/enlever un filtre (Toggle)
    const toggleCategory = (catId: string) => {
        setSelectedCategories(prev => 
            prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
        );
    };

    const toggleTech = (tech: string) => {
        setSelectedTechs(prev => 
            prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
        );
    };

    // Compteur pour le badge
    const activeFiltersCount = selectedCategories.length + selectedTechs.length;

    const categories = [
        { id: 'professional', label: language === 'fr' ? 'Professionnel' : 'Professional', icon: <Briefcase size={16} /> },
        { id: 'academic', label: language === 'fr' ? 'Académique' : 'Academic', icon: <GraduationCap size={16} /> },
        { id: 'personal', label: language === 'fr' ? 'Personnel' : 'Personal', icon: <User size={16} /> },
    ];

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
                    <div className="text-center">
                        <h1 className="text-3xl sm:text-4xl font-black text-[#151621] dark:text-white">{language === 'fr' ? "Projets Réalisés" : "Realized Projects"}</h1>
                        <span className="block h-1.5 w-24 bg-[#b8b2b0] mx-auto mt-4 rounded-full"></span>
                    </div>
                    <button onClick={() => setIsFilterOpen(true)} className={`flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#151621] rounded-full font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg border transition-all relative ${activeFiltersCount > 0 ? 'border-[#b8b2b0] text-[#151621] dark:text-white' : 'border-slate-100 dark:border-white/10 text-[#151621] dark:text-white hover:border-[#b8b2b0]'}`}>
                        <Filter size={16} className={activeFiltersCount > 0 ? "text-[#b8b2b0]" : ""} />
                        {language === 'fr' ? "Filtrer" : "Filter"}
                        {activeFiltersCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#b8b2b0] text-white flex items-center justify-center rounded-full text-[10px] font-black shadow-sm">{activeFiltersCount}</span>}
                    </button>
                </div>

                {/* --- RÉSULTATS --- */}
                {filteredProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProjects.map((project, idx) => {
                            const catStyle = getCategoryStyle(project.category);
                            return (
                                <article
                                    key={project.slug || project.title}
                                    onClick={() => setSelectedProject(project)}
                                    className="group cursor-pointer bg-white dark:bg-[#151621] rounded-[1.75rem] overflow-hidden shadow-[0_18px_50px_rgba(15,23,42,0.08)] hover:shadow-[0_26px_70px_rgba(15,23,42,0.16)] hover:-translate-y-2 transition-all duration-500 border border-slate-100 dark:border-white/5 flex flex-col h-full animate-in fade-in zoom-in-95 duration-500 transform-gpu"
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
                                        <div className="mt-auto flex flex-wrap gap-2">{project.technologies.slice(0, 4).map((tech, i) => (<span key={i} className="px-2 py-1 bg-slate-100 dark:bg-white/10 text-[#151621] dark:text-gray-300 text-[10px] font-bold uppercase tracking-widest rounded-md">{tech}</span>))}{project.technologies.length > 4 && <span className="px-2 py-1 text-slate-400 text-[10px] font-bold">+{project.technologies.length - 4}</span>}</div>
                                    </div>
                                    <div className="px-6 pb-6 pt-0 flex items-center justify-between gap-3 mt-auto text-[11px] font-bold text-slate-400">
                                        <span className="flex items-center gap-1.5"><CalendarDays size={14} /> {project.lastActivity || (language === 'fr' ? 'Analysé' : 'Analyzed')}</span>
                                        <span className="flex items-center gap-2">{project.githubUrl && <Github size={16} />}{project.demoUrl && <Rocket size={16} className="text-[#b8b2b0]" />}</span>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 animate-in fade-in">
                        <div className="inline-flex justify-center items-center w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full mb-4 text-gray-400"><Filter size={32} /></div>
                        <h3 className="text-xl font-black text-[#151621] dark:text-white mb-2">{language === 'fr' ? 'Aucun projet trouvé' : 'No projects found'}</h3>
                        <p className="text-slate-500 dark:text-gray-400 mb-6">{language === 'fr' ? 'Essayez de changer les filtres de recherche.' : 'Try changing the search filters.'}</p>
                        <button onClick={() => { setSelectedCategories([]); setSelectedTechs([]); }} className="px-6 py-2 bg-[#b8b2b0] text-white rounded-full text-xs font-black uppercase tracking-widest">{language === 'fr' ? 'Réinitialiser' : 'Reset'}</button>
                    </div>
                )}


                {/* --- MODAL DE FILTRES --- */}
                {isFilterOpen && (
                    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:px-4 animate-in fade-in duration-200">
                         <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)}></div>
                         <div className="relative bg-white dark:bg-[#1e212b] w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
                            
                            <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                                <h2 className="text-lg font-black text-[#151621] dark:text-white uppercase tracking-widest flex items-center gap-2"><Filter size={18} className="text-[#b8b2b0]" /> {language === 'fr' ? 'Filtres' : 'Filters'}</h2>
                                <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-slate-100 dark:bg-white/10 rounded-full hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"><X size={18} /></button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
                                
                                {/* 1. Catégories (Multi-Select) */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{language === 'fr' ? 'Catégories' : 'Categories'}</h3>
                                        {selectedCategories.length > 0 && <button onClick={() => setSelectedCategories([])} className="text-[10px] font-bold text-[#b8b2b0] uppercase hover:underline">{language === 'fr' ? 'Effacer' : 'Clear'}</button>}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {categories.map((cat) => {
                                            const isSelected = selectedCategories.includes(cat.id);
                                            return (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => toggleCategory(cat.id)}
                                                    className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left group
                                                    ${isSelected 
                                                        ? 'border-[#b8b2b0] bg-[#b8b2b0]/10 text-[#b8b2b0]'
                                                        : 'border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-gray-300 hover:border-[#b8b2b0]/50'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className={isSelected ? "text-[#b8b2b0]" : "text-slate-400 group-hover:text-[#b8b2b0]"}>{cat.icon}</span>
                                                        <span className="font-bold text-sm">{cat.label}</span>
                                                    </div>
                                                    {isSelected && <Check size={16} />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 2. Technologies (Multi-Select) */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{language === 'fr' ? 'Technologies' : 'Technologies'}</h3>
                                        {selectedTechs.length > 0 && <button onClick={() => setSelectedTechs([])} className="text-[10px] font-bold text-[#b8b2b0] uppercase hover:underline">{language === 'fr' ? 'Effacer' : 'Clear'}</button>}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {allTechnologies.map((tech) => {
                                            const isSelected = selectedTechs.includes(tech);
                                            return (
                                                <button
                                                    key={tech}
                                                    onClick={() => toggleTech(tech)}
                                                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5
                                                    ${isSelected
                                                        ? 'bg-[#b8b2b0] text-white border-[#b8b2b0] shadow-md'
                                                        : 'bg-white dark:bg-white/5 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-white/10 hover:border-[#b8b2b0] hover:text-[#b8b2b0]'}`}
                                                >
                                                    {tech}
                                                    {isSelected && <Check size={12} />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                                <button onClick={() => setIsFilterOpen(false)} className="w-full py-3.5 bg-[#151621] dark:bg-white text-white dark:text-[#151621] rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#b8b2b0] dark:hover:bg-[#b8b2b0] dark:hover:text-white transition-all shadow-lg">
                                    {language === 'fr' ? `Voir les résultats (${filteredProjects.length})` : `Show Results (${filteredProjects.length})`}
                                </button>
                            </div>
                         </div>
                    </div>
                )}


                {/* --- MODAL DE DÉTAILS PROJET --- */}
                {selectedProject && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer" onClick={() => setSelectedProject(null)}></div>
                        <div className="relative bg-white dark:bg-[#1e212b] w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
                            <button onClick={() => setSelectedProject(null)} className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"><X size={20} /></button>
                             <div className="h-56 sm:h-72 w-full shrink-0 relative bg-[radial-gradient(circle_at_top_left,rgba(184,178,176,0.28),transparent_36%),linear-gradient(135deg,#f8fafc,#e7ebf1)] dark:bg-[radial-gradient(circle_at_top_left,rgba(184,178,176,0.18),transparent_40%),linear-gradient(135deg,#1e212b,#11131b)]">
                                {selectedProject.imageUrl && <img src={selectedProject.imageUrl} alt={selectedProject.title} className="w-full h-full object-contain p-10" />}
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
                                {(selectedProject.type || selectedProject.complexity || selectedProject.lastActivity) && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                                        {selectedProject.type && <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"><p className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><FolderGit2 size={13} /> Type</p><p className="text-sm font-black text-[#151621] dark:text-white">{selectedProject.type}</p></div>}
                                        {selectedProject.complexity && <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"><p className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><Activity size={13} /> {language === 'fr' ? 'Complexité' : 'Complexity'}</p><p className="text-sm font-black text-[#151621] dark:text-white">{selectedProject.complexity}</p></div>}
                                        {selectedProject.lastActivity && <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"><p className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><CalendarDays size={13} /> {language === 'fr' ? 'Activité' : 'Activity'}</p><p className="text-sm font-black text-[#151621] dark:text-white">{selectedProject.lastActivity}</p></div>}
                                    </div>
                                )}
                                <div className="mb-8">
                                    <h3 className="text-xs font-black text-[#b8b2b0] uppercase tracking-widest mb-3 flex items-center gap-2">{language === 'fr' ? 'À propos du projet' : 'About the Project'}<span className="h-px bg-[#b8b2b0]/20 flex-grow"></span></h3>
                                    <p className="text-slate-600 dark:text-gray-300 text-base leading-relaxed">{selectedProject.fullDescription || selectedProject.description}</p>
                                </div>
                                {selectedProject.features && (
                                    <div className="mb-8">
                                        <h3 className="text-xs font-black text-[#b8b2b0] uppercase tracking-widest mb-3">{language === 'fr' ? 'Fonctionnalités clés' : 'Key Features'}</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {selectedProject.features.map((feature) => (
                                                <div key={feature} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                                                    <Check size={16} className="mt-0.5 shrink-0 text-[#b8b2b0]" />
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="mb-8">
                                    <h3 className="text-xs font-black text-[#b8b2b0] uppercase tracking-widest mb-3">{language === 'fr' ? 'Technologies utilisées' : 'Technologies Used'}</h3>
                                    <div className="flex flex-wrap gap-2">{selectedProject.technologies.map((tech, i) => (<span key={i} className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-[#151621] dark:text-white text-xs font-bold rounded-lg border border-slate-200 dark:border-white/10">{tech}</span>))}</div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100 dark:border-white/10 mt-auto">
                                   {selectedProject.githubUrl ? ( <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#151621] dark:bg-white text-white dark:text-[#151621] font-black uppercase tracking-widest text-xs hover:opacity-90 transition-opacity shadow-lg"><Github size={18} /> GitHub</a> ) : ( <button disabled className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400 font-black uppercase tracking-widest text-xs cursor-not-allowed border border-dashed border-gray-300 dark:border-gray-700"><Github size={18} /> {language === 'fr' ? 'Code Privé' : 'Private Code'}</button> )}
                                   {selectedProject.demoUrl && ( <a href={selectedProject.demoUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#b8b2b0] text-white font-black uppercase tracking-widest text-xs hover:bg-[#9f9896] transition-colors shadow-lg shadow-[#b8b2b0]/30 hover:shadow-xl hover:-translate-y-0.5"><Rocket size={18} /> {language === 'fr' ? 'Voir le projet' : 'Live Demo'}</a> )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AllProjectsPage;
