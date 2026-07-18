import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { REALIZED_PROJECTS, TRANSLATIONS } from '../../constants';
import { Language, Project } from '../../types';
import { ArrowLeft, Github, Briefcase, GraduationCap, User, X, Eye, Rocket, Filter,
  Check, Activity, CalendarDays, FolderGit2, ShieldCheck, Sparkles } from 'lucide-react';
import { useRevealOnScroll } from '../../hooks/useRevealOnScroll';
import { Grid } from 'react-window';

interface AllProjectsPageProps {
    language: Language;
}

const ModalPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return createPortal(children, document.body);
};

const FEATURED_TECH_FILTERS = [
    { value: 'React', label: 'React' },
    { value: 'Django', label: 'Django' },
    { value: 'Express', label: 'Express JS' },
    { value: 'PostgreSQL', label: 'PostgreSQL' },
    { value: 'TypeScript', label: 'TypeScript' },
    { value: 'Node.js', label: 'Node.js' },
    { value: 'Tailwind CSS', label: 'Tailwind CSS' },
    { value: 'Prisma', label: 'Prisma' },
];

const AllProjectsPage: React.FC<AllProjectsPageProps> = ({ language }) => {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const revealRef = useRevealOnScroll<HTMLDivElement>();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedTechs, setSelectedTechs] = useState<string[]>([]);

    useLayoutEffect(() => {
        const isLocked = selectedProject !== null || isFilterOpen;
        document.body.style.overflow = isLocked ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [selectedProject, isFilterOpen]);

    const t = TRANSLATIONS[language];
    const projects = REALIZED_PROJECTS[language];

    const featuredTechnologies = useMemo(() => {
        const techs = new Set<string>();
        projects.forEach(p => p.technologies.forEach(t => techs.add(t)));
        return FEATURED_TECH_FILTERS.filter(tech => techs.has(tech.value));
    }, [projects]);

    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(project.category);
            const matchTech = selectedTechs.length === 0 || project.technologies.some(t => selectedTechs.includes(t));
            return matchCategory && matchTech;
        });
    }, [projects, selectedCategories, selectedTechs]);

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

    const activeFiltersCount = selectedCategories.length + selectedTechs.length;

    const resetFilters = () => {
        setSelectedCategories([]);
        setSelectedTechs([]);
    };

    const categories = [
        { id: 'professional', label: language === 'fr' ? 'Professionnel' : 'Professional', icon: <Briefcase size={16} /> },
        { id: 'academic', label: language === 'fr' ? 'Académique' : 'Academic', icon: <GraduationCap size={16} /> },
        { id: 'personal', label: language === 'fr' ? 'Personnel' : 'Personal', icon: <User size={16} /> },
    ];

    const [columnCount, setColumnCount] = useState(() => {
        const width = typeof window !== 'undefined' ? window.innerWidth : 0;
        if (width < 640) return 1;
        if (width < 768) return 2;
        return 3;
    });

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            let cols = 1;
            if (width >= 640 && width < 768) cols = 2;
            else if (width >= 768) cols = 3;
            setColumnCount(cols);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const containerRef = useRef<HTMLDivElement>(null);
    const [columnWidth, setColumnWidth] = useState(0);
    const rowHeight = 300;

    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const width = entry.contentRect.width;
                const gap = 16;
                const cols = columnCount;
                const widthPerCol = (cols > 0) ? (width - (width - (cols - 1) * gap) / cols : 0;
                setColumnWidth(widthPerCol);
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, [columnCount]);

    return (
        <div ref={revealRef} className="pt-28 pb-12 px-4 sm:px-6 box-border min-h-[inherit]">
            <div className="max-w-6xl mx-auto">
                <div className="portfolio-reveal flex flex-col md:flex-row items-center justify-between gap-6 mb-12 relative">
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

                <div ref={containerRef} className="relative">
                    {filteredProjects.length > 0 ? (
                        <Grid
                            columnCount={columnCount}
                            columnWidth={columnWidth > 0 ? columnWidth : 250}
                            rowCount={Math.ceil(filteredProjects.length / columnCount)}
                            rowHeight={rowHeight}
                            overscanColumnCount={1}
                            overscanRowCount={1}
                            cellComponent={({ columnIndex, rowIndex, style }) => {
                                const index = rowIndex * columnCount + columnIndex;
                                if (index >= filteredProjects.length) return null;
                                const project = filteredProjects[index];
                                const getCategoryStyle = (category: string) => {
                                    switch (category) {
                                        case 'professional': return { icon: <Briefcase size={14} />, bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-300', label: language === 'fr' ? 'Professionnel' : 'Professional' };
                                        case 'academic': return { icon: <GraduationCap size={14} />, bg: 'bg-purple-100 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-300', label: language === 'fr' ? 'Academic' : 'Academic' };
                                        default: return { icon: <User size={14} />, bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-300', label: language === 'fr' ? 'Personnel' : 'Personal' };
                                    }
                                };
                                const catStyle = getCategoryStyle(project.category);
                                return (
                                    <div style={style}>
                                        <ProjectCard project={project} language={language} />
                                    </div>
                                );
                            }}
                        />
                    ) : (
                        <div className="text-center py-20 animate-in fade-in">
                            <div className="inline-flex justify-center items-center w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full mb-4 text-gray-400"><Filter size={32} /></div>
                            <h3 className="text-xl font-black text-[#151621] dark:text-white mb-2">{language === 'fr' ? 'Aucun projet trouvé' : 'No projects found'}</h3>
                            <p className="text-slate-500 dark:text-gray-400 mb-6">{language === 'fr' ? 'Essayez de changer les filtres de recherche.' : 'Try changing the search filters.'}</p>
                            <button onClick={resetFilters} className="px-6 py-2 bg-[#b8b2b0] text-white rounded-full text-xs font-black uppercase tracking-widest">{language === 'fr' ? 'Réinitialiser' : 'Reset'}</button>
                        </div>
                    )}
                </div>

                {isFilterOpen && (
                    <ModalPortal>
                        <div className="fixed inset-0 z-[300] flex items-end justify-center sm:items-center sm:px-5 animate-in fade-in duration-200">
                            <div className="absolute inset-0 bg-[#151621]/75 backdrop-blur-xl" onClick={() => setIsFilterOpen(false)}></div>
                            <div className="relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[1.75rem] border border-white/75 bg-white shadow-[0_34px_110px_rgba(15,23,42,0.42)] animate-in slide-in-from-bottom-10 duration-300 sm:rounded-[1.75rem] sm:zoom-in-95 dark:border-white/10 dark:bg-[#1e212b]">
                                <div className="relative overflow-hidden border-b border-slate-100 px-6 py-5 sm:px-7 dark:border-white/10">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(184,178,176,0.28),transparent_34%),linear-gradient(135deg,#ffffff,#f6f7f9)] dark:bg-[radial-gradient(circle_at_top_left,rgba(184,178,176,0.16),transparent_38%),linear-gradient(135deg,#242733,#171923)]"></div>
                                    <div className="relative flex items-start justify-between gap-4">
                                        <div>
                                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#b8b2b0]/30 bg-white/70 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#b8b2b0] shadow-sm backdrop-blur dark:bg-white/10">
                                                <Filter size={13} />
                                                {language === 'fr' ? 'Recherche avancée' : 'Advanced Search'}
                                            </div>
                                            <h2 className="text-2xl font-black leading-tight text-[#151621] dark:text-white">{language === 'fr' ? 'Affiner les projets' : 'Refine Projects'}</h2>
                                            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-gray-400">
                                                {language === 'fr'
                                                    ? `${filteredProjects.length} résultat${filteredProjects.length > 1 ? 's' : ''} selon votre sélection.`
                                                    : `${filteredProjects.length} result${filteredProjects.length > 1 ? 's' : ''} based on your selection.`}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setIsFilterOpen(false)}
                                            aria-label={language === 'fr' ? 'Fermer les filtres' : 'Close filters'}
                                            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-[#151621] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#b8b2b0] hover:text-[#b8b2b0] dark:border-white/10 dark:bg-white/10 dark:text-white"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-y-auto p-5 sm:p-7 custom-scrollbar">
                                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 sm:p-5 dark:border-white/10 dark:bg-white/[0.04]">
                                        <div className="mb-4 flex items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-sm font-black text-[#151621] dark:text-white">{language === 'fr' ? 'Catégories' : 'Categories'}</h3>
                                                <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">{language === 'fr' ? 'Sélection multiple possible' : 'Multiple selections allowed'}</p>
                                            </div>
                                            {selectedCategories.length > 0 && <button onClick={() => setSelectedCategories([])} className="shrink-0 text-[10px] font-black uppercase tracking-widest text-[#b8b2b0] transition-colors hover:text-[#151621] dark:hover:text-white">{language === 'fr' ? 'Effacer' : 'Clear'}</button>}
                                        </div>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                            {categories.map((cat) => {
                                                const isSelected = selectedCategories.includes(cat.id);
                                                return (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => toggleCategory(cat.id)}
                                                        className={`group flex min-h-[92px] flex-col justify-between rounded-xl border p-4 text-left transition-all
                                                        ${isSelected 
                                                            ? 'border-[#b8b2b0] bg-white text-[#151621] shadow-[0_14px_34px_rgba(184,178,176,0.22)] dark:bg-white/10 dark:text-white'
                                                            : 'border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-[#b8b2b0]/70 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-gray-300'}`}
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <span className={`grid h-9 w-9 place-items-center rounded-full ${isSelected ? 'bg-[#b8b2b0] text-white' : 'bg-slate-100 text-slate-400 group-hover:text-[#b8b2b0] dark:bg-white/10'}`}>{cat.icon}</span>
                                                            <span className={`grid h-6 w-6 place-items-center rounded-full border ${isSelected ? 'border-[#b8b2b0] bg-[#b8b2b0] text-white' : 'border-slate-200 text-transparent dark:border-white/10'}`}>
                                                                <Check size={13} />
                                                            </span>
                                                        </div>
                                                        <span className="mt-4 text-sm font-black">{cat.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 dark:border-white/10 dark:bg-white/[0.03]">
                                        <div className="mb-4 flex items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-sm font-black text-[#151621] dark:text-white">{language === 'fr' ? 'Technologies' : 'Technologies'}</h3>
                                                <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">{language === 'fr' ? 'Choisissez les stacks à afficher' : 'Choose the stacks to display'}</p>
                                            </div>
                                            {selectedTechs.length > 0 && <button onClick={() => setSelectedTechs([])} className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-[#b8b2b0] transition-colors hover:text-[#151621] dark:hover:text-white">{language === 'fr' ? 'Effacer' : 'Clear'}</button>}
                                        </div>
                                        <div className="flex max-h-56 flex-wrap gap-2 overflow-y-auto pr-1 custom-scrollbar">
                                            {featuredTechnologies.map((tech) => {
                                                const isSelected = selectedTechs.includes(tech.value);
                                                return (
                                                    <button
                                                        key={tech.value}
                                                        onClick={() => toggleTech(tech.value)}
                                                        className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition-all
                                                        ${isSelected
                                                            ? 'border-[#b8b2b0] bg-[#151621] text-white shadow-md dark:bg-white dark:text-[#151621]'
                                                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:-translate-y-0.5 hover:border-[#b8b2b0] hover:bg-white hover:text-[#151621] dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:text-white'}`}
                                                    >
                                                        <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-[#b8b2b0]' : 'bg-slate-300 dark:bg-white/30'}`}></span>
                                                        {tech.label}
                                                        {isSelected && <Check size={12} />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 border-t border-slate-100 bg-gray-50/90 p-4 sm:flex-row dark:border-white/10 dark:bg-white/5">
                                    <button
                                        onClick={resetFilters}
                                        disabled={activeFiltersCount === 0}
                                        className="rounded-xl border border-slate-200 px-5 py-3.5 text-xs font-black uppercase tracking-widest text-[#151621] transition-all hover:border-[#b8b2b0] hover:text-[#b8b2b0] disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-white"
                                    >
                                        {language === 'fr' ? 'Réinitialiser' : 'Reset'}
                                    </button>
                                    <button onClick={() => setIsFilterOpen(false)} className="flex-1 rounded-xl bg-[#151621] px-5 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-[#151621]/15 transition-all hover:-translate-y-0.5 hover:bg-[#b8b2b0] dark:bg-white dark:text-[#151621] dark:hover:bg-[#b8b2b0] dark:hover:text-white">
                                        {language === 'fr' ? `Voir les résultats (${filteredProjects.length})` : `Show Results (${filteredProjects.length})`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </ModalPortal>
                )}

                {selectedProject && (
                    <ModalPortal>
                        <div className="fixed inset-0 z-[300] flex items-center justify-center px-4 py-6 animate-in fade-in duration-300 sm:py-8">
                            <div className="absolute inset-0 cursor-pointer bg-[#151621]/75 backdrop-blur-md" onClick={() => setSelectedProject(null)}></div>
                            <div className="relative flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-[1.5rem] border border-white/70 bg-white shadow-[0_32px_100px_rgba(15,23,42,0.38)] animate-in zoom-in-95 duration-300 sm:rounded-[1.75rem] dark:border-white/10 dark:bg-[#1e212b]">
                                <button onClick={() => setSelectedProject(null)} className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"><X size={20} /></button>
                                <div className="h-56 sm:h-72 w-full shrink-0 relative bg-[radial-gradient(circle_at_top_left,rgba(184,178,176,0.28),transparent_36%),linear-gradient(135deg,#f8fafc,#e7ebf1)] dark:bg-[radial-gradient(circle_at_top_left,rgba(184,178,176,0.18),transparent_40%),linear-gradient(135deg,#1e212b,#11131b)]">
                                    {selectedProject.imageUrl && <img src={selectedProject.imageUrl} alt={selectedProject.title} className="w-full h-full object-contain p-10" />}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                                    <div className="absolute bottom-6 left-6 sm:left-8 right-6">
                                        <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 shadow-sm">{selectedProject.title}</h2>
                                        {(() => {
                                            const getCategoryStyle = (category: string) => {
                                                switch (category) {
                                                    case 'professional': return { icon: <Briefcase size={14} />, bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-300', label: language === 'fr' ? 'Professionnel' : 'Professional' };
                                                    case 'academic': return { icon: <GraduationCap size={14} />, bg: 'bg-purple-100 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-300', label: language === 'fr' ? 'Academic' : 'Academic' };
                                                    default: return { icon: <User size={14} />, bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-300', label: language === 'fr' ? 'Personnel' : 'Personal' };
                                                }
                                            };
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
                                            <h3 className="text-xs font-black text-[#b8b2b0] uppercase tracking-widest mb-3>{language === 'fr' ? 'Fonctionnalités clés' : 'Key Features'}</h3>
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
                                        <h3 className="text-xs font-black text-[#b8b2b0] uppercase tracking-widest mb-3>{language === 'fr' ? 'Technologies utilisées' : 'Technologies Used'}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {(() => {
                                                const backendSet = new Set(['Django', 'PostgreSQL', 'Express', 'Prisma', 'Node.js', 'Spring Boot', 'Python', 'Java']);
                                                const frontendSet = new Set(['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS']);
                                                const deploymentSet = new Set(['Render', 'Neon', 'AWS', 'Heroku', 'Vercel', 'Netlify']);
                                                const backend: string[] = [];
                                                const frontend: string[] = [];
                                                const deployment: string[] = [];
                                                selectedProject.technologies.forEach(tech => {
                                                    if (backendSet.has(tech)) backend.push(tech);
                                                    else if (frontendSet.has(tech)) frontend.push(tech);
                                                    else if (deploymentSet.has(tech)) deployment.push(tech);
                                                });
                                                const backendTitle = language === 'fr' ? 'Backend' : 'Backend';
                                                const frontendTitle = language === 'fr' ? 'Frontend' : 'Frontend';
                                                const deployTitle = language === 'fr' ? 'Déploiement' : 'Deployment';
                                                return (
                                                    <>
                                                        {backend.length > 0 && (
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-xs font-bold uppercase tracking-wider">{backendTitle}</span>
                                                                {backend.map((tech, idx) => (
                                                                    <span key={idx} className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-[#151621] dark:text-white text-xs font-bold rounded-lg border border-slate-200 dark:border-white/10">
                                                                        {tech}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {frontend.length > 0 && (
                                                            <div className="flex flex-col gap-1 ml-4">
                                                                <span className="text-xs font-bold uppercase tracking-wider">{frontendTitle}</span>
                                                                {frontend.map((tech, idx) => (
                                                                    <span key={idx} className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-[#151621] dark:text-white text-xs font-bold rounded-lg border border-slate-200 dark:border-white/10">
                                                                        {tech}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {deployment.length > 0 && (
                                                            <div className="flex flex-col gap-1 ml-4">
                                                                <span className="text-xs font-bold uppercase tracking-wider">{deployTitle}</span>
                                                                {deployment.map((tech, idx) => (
                                                                    <span key={idx} className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-[#151621] dark:text-white text-xs font-bold rounded-lg border border-slate-200 dark:border-white/10">
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

                                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100 dark:border-white/10 mt-auto">
                                        {selectedProject.githubUrl ? ( <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#151621] dark:bg-white text-white dark:text-[#151621] font-black uppercase tracking-widest text-xs hover:opacity-90 transition-opacity shadow-lg"><Github size={18} /> GitHub</a> ) : ( <button disabled className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400 font-black uppercase tracking-widest text-xs cursor-not-allowed border border-dashed border-gray-300 dark:border-gray-700"><Github size={18} /> {language === 'fr' ? 'Code Privé' : 'Private Code'</button> )}
                                        {selectedProject.demoUrl && ( <a href={selectedProject.demoUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#b8b2b0] text-white font-black uppercase tracking-widest text-xs hover:bg-[#9f9896] transition-colors shadow-lg shadow-[#b8b2b0]/30 hover:shadow-xl hover:-translate-y-0.5"><Rocket size={18} /> {language === 'fr' ? 'Voir le projet' : 'Live Demo'}</a> )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ModalPortal>
                )}
            </div>
        </div>
    );
};

export default AllProjectsPage;
