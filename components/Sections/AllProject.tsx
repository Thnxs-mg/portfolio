import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, usePresence } from 'framer-motion';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { REALIZED_PROJECTS } from '../../constants';
import { Language, Project } from '../../types';
import { ArrowLeft, Github, Briefcase, GraduationCap, User, X, Eye, Rocket, Filter, Check, CalendarDays, ShieldCheck, Sparkles } from 'lucide-react';
import { useRevealOnScroll } from '../../hooks/useRevealOnScroll';

interface AllProjectsPageProps {
    language: Language;
    isActive: boolean;
}

const ModalPortal: React.FC<{ children: React.ReactNode; onClose: () => void; label: string }> = ({ children, onClose, label }) => {
    const ref = useRef<HTMLDialogElement>(null);
    const [isPresent, safeToRemove] = usePresence();
    useEffect(() => {
        if (isPresent || !safeToRemove) return;
        const dialog = ref.current;
        const panel = dialog?.querySelector('.cinema-modal');
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (!panel?.animate || reduced.matches) { safeToRemove(); return; }
        dialog.dataset.closing = 'true';
        const currentStyle = getComputedStyle(panel);
        const animation = panel.animate([
            { opacity: currentStyle.opacity, transform: currentStyle.transform },
            { opacity: 0, transform: 'translateY(8px)' },
        ], { duration: 150, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'forwards' });
        animation.finished.then(safeToRemove, () => {});
        const preferenceChanged = () => { if (reduced.matches) safeToRemove(); };
        reduced.addEventListener('change', preferenceChanged);
        return () => { animation.cancel(); reduced.removeEventListener('change', preferenceChanged); };
    }, [isPresent, safeToRemove]);
    useEffect(() => {
        const dialog = ref.current;
        const previousFocus = document.activeElement;
        dialog?.showModal();
        document.body.style.overflow = 'hidden';
        return () => {
            dialog?.close();
            if (!document.querySelector('.cinema-dialog[open]')) document.body.style.overflow = '';
            if (previousFocus instanceof HTMLElement && previousFocus.isConnected && previousFocus.getClientRects().length) {
                previousFocus.focus({ preventScroll: true });
            } else {
                document.getElementById('main-content')?.focus({ preventScroll: true });
            }
        };
    }, []);
    return createPortal(
        <dialog ref={ref} className="cinema-dialog" aria-label={label} onClick={event => { if (event.target === event.currentTarget) onClose(); }} onCancel={event => { event.preventDefault(); onClose(); }}>
            {children}
        </dialog>, document.body
    );
};

const FEATURED_TECH_FILTERS = [
    { value: 'React', label: 'React' },
    { value: 'Django', label: 'Django' },
    { value: 'Express', label: 'Express JS' },
    { value: 'Spring Boot', label: 'Spring Boot' },
{ value: 'PostgreSQL', label: 'PostgreSQL' },
{ value: 'MySQL', label: 'MySQL' },
    { value: 'TypeScript', label: 'TypeScript' },
    { value: 'Node.js', label: 'Node.js' },
    { value: 'Tailwind CSS', label: 'Tailwind CSS' },
    { value: 'Prisma', label: 'Prisma' },
];

const AllProjectsPage: React.FC<AllProjectsPageProps> = ({ language, isActive }) => {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const { pathname } = useLocation();
    const revealRef = useRevealOnScroll<HTMLDivElement>();
    
    // --- ÉTATS POUR LES FILTRES (MULTI-SELECTION) ---
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    // Tableaux pour stocker plusieurs valeurs
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]); 
    const [selectedTechs, setSelectedTechs] = useState<string[]>([]);

    const projects = REALIZED_PROJECTS[language];

    useEffect(() => {
        if (pathname !== '/realisations' || !isActive) {
            setSelectedProject(null);
            setIsFilterOpen(false);
            return;
        }
        setSelectedProject(current => {
            const slug = searchParams.get('project') || current?.slug;
            return projects.find(project => project.slug === slug) || null;
        });
    }, [searchParams, projects, pathname, isActive]);

    const closeProject = () => {
        setSelectedProject(null);
        if (searchParams.has('project')) {
            const next = new URLSearchParams(searchParams);
            next.delete('project');
            setSearchParams(next, { replace: true });
        }
    };


    // 1. Garder uniquement les technologies fortes pour le filtre
    const featuredTechnologies = useMemo(() => {
        const techs = new Set<string>();
        projects.forEach(p => p.technologies.forEach(t => techs.add(t)));
        return FEATURED_TECH_FILTERS.filter(tech => techs.has(tech.value));
    }, [projects]);

    // 2. LOGIQUE DE FILTRAGE MULTI-CRITÈRES
    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            // Catégorie : Si aucune sélectionnée (tableau vide) => Tout montrer. Sinon, doit être dans la liste.
            const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(project.category);
            
            // Tech : Si aucune sélectionnée => Tout montrer. Sinon, le projet doit avoir au moins une des techs sélectionnées.
            const matchTech = selectedTechs.length === 0 || project.technologies.some(t => selectedTechs.includes(t));
            
            return matchCategory && matchTech;
        });
    }, [projects, selectedCategories, selectedTechs]);

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

    const resetFilters = () => {
        setSelectedCategories([]);
        setSelectedTechs([]);
    };

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
        <div ref={revealRef} className="cinema-projects min-h-screen">
            <div className="max-w-6xl mx-auto">

                {/* --- Header --- */}
                <div className="cinema-project-header mb-4">
                    <Link to="/" className="group flex items-center gap-2 text-[#151621] dark:text-white font-black uppercase tracking-widest text-xs hover:text-[#45b7aa] transition-colors">
                        <div className="p-2 bg-white dark:bg-white/10 rounded-full group-hover:bg-[#45b7aa] group-hover:text-white transition-all shadow-md border border-slate-100 dark:border-white/5"><ArrowLeft size={18} /></div>
                        {language === 'fr' ? "Retour" : "Back"}
                    </Link>
                    <div className="text-center">
                        <h1 className="text-3xl sm:text-4xl font-black text-[#151621] dark:text-white">{language === 'fr' ? "Projets Réalisés" : "Realized Projects"}</h1>
                        <span className="block h-1.5 w-24 bg-[#45b7aa] mx-auto mt-4 rounded-full"></span>
                    </div>
                    <button onClick={() => setIsFilterOpen(true)} className={`flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#151621] rounded-full font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg border transition-all relative ${activeFiltersCount > 0 ? 'border-[#45b7aa] text-[#151621] dark:text-white' : 'border-slate-100 dark:border-white/10 text-[#151621] dark:text-white hover:border-[#45b7aa]'}`}>
                        <Filter size={16} className={activeFiltersCount > 0 ? "text-[#45b7aa]" : ""} />
                        {language === 'fr' ? "Filtrer" : "Filter"}
                        {activeFiltersCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#45b7aa] text-[#151621] flex items-center justify-center rounded-full text-[10px] font-black shadow-sm">{activeFiltersCount}</span>}
                    </button>
                </div>

                {/* --- RÉSULTATS --- */}
                {filteredProjects.length > 0 ? (
                    <div className="cinema-project-grid">
                        {filteredProjects.map((project, idx) => {
                            const catStyle = getCategoryStyle(project.category);
                            return (
                                <article
                                    key={project.slug || project.title}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`${language === 'fr' ? 'Détails de' : 'Details of'} ${project.title}`}
                                    onKeyDown={event => {
                                        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedProject(project); }
                                    }}
                                    onClick={() => setSelectedProject(project)}
                                    className="cinema-project-entry portfolio-reveal group cursor-pointer bg-white dark:bg-[#151621] rounded-[1.75rem] overflow-hidden shadow-[0_18px_50px_rgba(15,23,42,0.08)] hover:shadow-[0_30px_80px_rgba(69,183,170,0.20)] hover:-translate-y-2 transition-all duration-500 border border-slate-100 dark:border-white/5 flex flex-col h-full transform-gpu"
                                >
                                    <div className="relative h-48 w-full overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(69,183,170,0.24),transparent_38%),linear-gradient(135deg,#f8fafc,#eef2f7)] dark:bg-[radial-gradient(circle_at_top_left,rgba(69,183,170,0.16),transparent_42%),linear-gradient(135deg,#1e212b,#11131b)]">
                                        {project.imageUrl ? (
                                            <img src={project.imageUrl} alt={project.title} loading="lazy" decoding="async" width="600" height="350" className="w-full h-full object-contain p-8 transition-transform duration-700 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400"><Briefcase size={32} /></div>
                                        )}
                                        <div className="absolute inset-0 bg-[#151621]/55 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"><span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2"><Eye size={16} /> {language === 'fr' ? 'Détails' : 'Details'}</span></div>
                                        <div className="absolute top-4 left-4"><div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/95 backdrop-blur shadow-sm ${catStyle.text}`}>{catStyle.icon} {catStyle.label}</div></div>
                                        {project.status && <div className="absolute top-4 right-4 max-w-[48%] truncate rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600 shadow-sm backdrop-blur dark:bg-[#151621]/85 dark:text-slate-200">{project.status}</div>}
                                    </div>
                                    <div className="cinema-project-info p-6 flex flex-col flex-grow">
                                        {project.type && <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#45b7aa]"><Sparkles size={13} /> {project.type}</div>}
                                        <h2 className="text-xl text-[#151621] dark:text-white mb-3">{project.title}</h2>
                                        <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed mb-5 line-clamp-3">{project.description}</p>
                                        {project.features && (
                                            <div className="mb-6 space-y-2">
                                                {project.features.slice(0, 2).map((feature) => (
                                                    <div key={feature} className="flex items-start gap-2 text-xs text-slate-500 dark:text-gray-400">
                                                        <ShieldCheck size={14} className="mt-0.5 shrink-0 text-[#45b7aa]" />
                                                        <span className="line-clamp-1">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="cinema-project-technologies mt-auto flex flex-wrap gap-2">{project.technologies.slice(0, 4).map((tech, i) => (<span key={i} className="px-2 py-1 bg-slate-100 dark:bg-white/10 text-[#151621] dark:text-gray-300 text-[10px] font-bold uppercase tracking-widest rounded-md">{tech}</span>))}{project.technologies.length > 4 && <span className="px-2 py-1 text-slate-400 text-[10px] font-bold">+{project.technologies.length - 4}</span>}</div>
                                    </div>
                                    <div className="px-6 pb-6 pt-0 flex items-center justify-between gap-3 mt-auto text-[11px] font-bold text-slate-400">
                                        <span className="flex items-center gap-1.5"><CalendarDays size={14} /> {project.lastActivity || (language === 'fr' ? 'Analysé' : 'Analyzed')}</span>
                                        <span className="flex items-center gap-2">{project.githubUrl && <Github size={16} />}{project.demoUrl && <Rocket size={16} className="text-[#45b7aa]" />}</span>
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
                        <button onClick={resetFilters} className="px-6 py-2 bg-[#45b7aa] text-[#151621] rounded-full text-xs font-black uppercase tracking-widest">{language === 'fr' ? 'Réinitialiser' : 'Reset'}</button>
                    </div>
                )}


                <AnimatePresence>
                {isFilterOpen && (
                    <ModalPortal key="filters" onClose={() => setIsFilterOpen(false)} label={language === 'fr' ? 'Affiner les projets' : 'Refine projects'}>
                        <div className="cinema-modal cinema-modal-filters">
                            <div className="cinema-modal-topline">
                                <span className="cinema-eyebrow">{language === 'fr' ? 'La collection / Filtres' : 'The collection / Filters'}</span>
                                <button onClick={() => setIsFilterOpen(false)} aria-label={language === 'fr' ? 'Fermer les filtres' : 'Close filters'} className="cinema-modal-close"><X size={19} /></button>
                            </div>
                            <header className="cinema-modal-heading">
                                <h2>{language === 'fr' ? 'Affiner les projets' : 'Refine projects'}</h2>
                                <p role="status">{language === 'fr' ? `${filteredProjects.length} résultat${filteredProjects.length > 1 ? 's' : ''} selon votre sélection.` : `${filteredProjects.length} result${filteredProjects.length > 1 ? 's' : ''} based on your selection.`}</p>
                            </header>
                            <div className="cinema-modal-body">
                                <section className="cinema-filter-group" aria-labelledby="filter-categories">
                                    <div className="cinema-filter-label">
                                        <h3 id="filter-categories">{language === 'fr' ? 'Catégories' : 'Categories'}</h3>
                                        {selectedCategories.length > 0 && <button onClick={() => setSelectedCategories([])}>{language === 'fr' ? 'Effacer' : 'Clear'}</button>}
                                    </div>
                                    <p className="cinema-filter-hint">{language === 'fr' ? 'Sélection multiple possible' : 'Multiple selections allowed'}</p>
                                    <div className="cinema-filter-options cinema-category-options">
                                        {categories.map(cat => (
                                            <button key={cat.id} aria-pressed={selectedCategories.includes(cat.id)} onClick={() => toggleCategory(cat.id)} className="cinema-filter-option">
                                                {cat.icon}<span>{cat.label}</span><Check size={14} className="cinema-selection-check" />
                                            </button>
                                        ))}
                                    </div>
                                </section>
                                <section className="cinema-filter-group" aria-labelledby="filter-technologies">
                                    <div className="cinema-filter-label">
                                        <h3 id="filter-technologies">Technologies</h3>
                                        {selectedTechs.length > 0 && <button onClick={() => setSelectedTechs([])}>{language === 'fr' ? 'Effacer' : 'Clear'}</button>}
                                    </div>
                                    <p className="cinema-filter-hint">{language === 'fr' ? 'Choisissez les stacks à afficher' : 'Choose the stacks to display'}</p>
                                    <div className="cinema-filter-options">
                                        {featuredTechnologies.map(tech => (
                                            <button key={tech.value} aria-pressed={selectedTechs.includes(tech.value)} onClick={() => toggleTech(tech.value)} className="cinema-filter-option">
                                                <span>{tech.label}</span><Check size={14} className="cinema-selection-check" />
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            </div>
                            <footer className="cinema-modal-footer">
                                <button onClick={resetFilters} disabled={activeFiltersCount === 0} className="cinema-modal-secondary">{language === 'fr' ? 'Réinitialiser' : 'Reset'}</button>
                                <button onClick={() => setIsFilterOpen(false)} className="cinema-button">{language === 'fr' ? `Voir les résultats (${filteredProjects.length})` : `Show Results (${filteredProjects.length})`}<ArrowLeft size={16} className="rotate-180" /></button>
                            </footer>
                        </div>
                    </ModalPortal>
                )}

                {selectedProject && (
                    <ModalPortal key="project" onClose={closeProject} label={selectedProject.title}>
                        <div className="cinema-modal cinema-modal-project">
                            <div className="cinema-modal-topline">
                                <span className="cinema-eyebrow">{language === 'fr' ? 'La collection' : 'The collection'} / {String(projects.indexOf(selectedProject) + 1).padStart(2, '0')}</span>
                                <button onClick={closeProject} aria-label={language === 'fr' ? 'Fermer le projet' : 'Close project'} className="cinema-modal-close"><X size={19} /></button>
                            </div>
                            <header className="cinema-modal-project-intro">
                                <div>
                                    <p className="cinema-modal-category">{getCategoryStyle(selectedProject.category).label}{selectedProject.status && <span> / {selectedProject.status}</span>}</p>
                                    <h2>{selectedProject.title}</h2>
                                </div>
                                {selectedProject.imageUrl && <div className="cinema-modal-art"><img src={selectedProject.imageUrl} alt={selectedProject.title} width="180" height="140" /></div>}
                            </header>
                            <div className="cinema-modal-body">
                                {(selectedProject.type || selectedProject.complexity || selectedProject.lastActivity) && (
                                    <dl className="cinema-modal-facts">
                                        {selectedProject.type && <div><dt>Type</dt><dd>{selectedProject.type}</dd></div>}
                                        {selectedProject.complexity && <div><dt>{language === 'fr' ? 'Complexité' : 'Complexity'}</dt><dd>{selectedProject.complexity}</dd></div>}
                                        {selectedProject.lastActivity && <div><dt>{language === 'fr' ? 'Activité' : 'Activity'}</dt><dd>{selectedProject.lastActivity}</dd></div>}
                                    </dl>
                                )}
                                <section className="cinema-project-story">
                                    <h3>{language === 'fr' ? 'À propos du projet' : 'About the project'}</h3>
                                    <p>{selectedProject.fullDescription || selectedProject.description}</p>
                                </section>
                                {selectedProject.features && (
                                    <section className="cinema-project-story">
                                        <h3>{language === 'fr' ? 'Fonctionnalités clés' : 'Key features'}</h3>
                                        <ul className="cinema-modal-features">
                                            {selectedProject.features.map(feature => <li key={feature}><Check size={15} /><span>{feature}</span></li>)}
                                        </ul>
                                    </section>
                                )}
                                <section className="cinema-project-story">
                                    <h3>{language === 'fr' ? 'Technologies utilisées' : 'Technologies used'}</h3>
                                    <ul className="cinema-modal-technologies">{selectedProject.technologies.map(tech => <li key={tech}>{tech}</li>)}</ul>
                                </section>
                            </div>
                            <footer className="cinema-modal-footer">
                                {selectedProject.githubUrl ? <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer" className="cinema-modal-secondary"><Github size={17} /> GitHub</a> : <button disabled className="cinema-modal-secondary"><Github size={17} />{language === 'fr' ? 'Code Privé' : 'Private Code'}</button>}
                                {selectedProject.demoUrl && <a href={selectedProject.demoUrl} target="_blank" rel="noopener noreferrer" className="cinema-button">{language === 'fr' ? 'Voir le projet' : 'Live Demo'}<Rocket size={16} /></a>}
                            </footer>
                        </div>
                    </ModalPortal>
                )}
                </AnimatePresence>

            </div>
        </div>
    );
};

export default AllProjectsPage;
