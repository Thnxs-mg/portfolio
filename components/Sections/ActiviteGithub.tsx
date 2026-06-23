import React, { useEffect, useMemo, useRef } from 'react';
import { useGitHubData } from '../../hooks/useGitHubData';
import { type GitHubContributionWeek, useGitHubContributions } from '../../hooks/useGitHubContributions';
import { GITHUB_USERNAME } from '../../constants';
import { Language } from '../../types';
import { Github, ExternalLink, GitCommit, BarChart3, PieChart, BookOpen, GitFork, Star, Users } from 'lucide-react';
import { CapsuleDivider } from '../Shared/StyledForms';

interface ActiviteGithubProps {
  language: Language;
}

const CONTRIBUTION_LEVELS = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_LABELS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
const DAY_LABELS = {
  fr: ['Lun', 'Mer', 'Ven'],
  en: ['Mon', 'Wed', 'Fri'],
};

const formatDate = (value: string | null, language: Language) => {
  if (!value) {
    return language === 'fr' ? 'Aucune activité publique' : 'No public activity';
  }

  return new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
};

const formatNumber = (value: number) => new Intl.NumberFormat('en', {
  notation: value >= 1000 ? 'compact' : 'standard',
}).format(value);

const useScrollReveal = () => {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !('IntersectionObserver' in window)) return;

    const elements = Array.from(container.querySelectorAll<HTMLElement>('.github-reveal'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    elements.forEach((element, index) => {
      element.style.setProperty('--reveal-delay', `${Math.min(index * 70, 420)}ms`);
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return containerRef;
};

const MetricItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
  <div className="rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4 min-w-0">
    <div className="flex items-center gap-2 text-[#b8b2b0] mb-3">
      {React.cloneElement(icon as React.ReactElement<any>, { size: 16 })}
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-2xl font-black text-[#151621] dark:text-white">{value}</p>
  </div>
);

const skeletonWeeks: GitHubContributionWeek[] = Array.from({ length: 53 }, () => ({
  days: Array.from({ length: 7 }, () => ({
    date: null,
    count: 0,
    level: 0,
    isOutsideRange: true,
  })),
}));

const buildMonthMarkers = (weeks: GitHubContributionWeek[], language: Language) => {
  let previousMonth = -1;
  const labels = language === 'fr' ? MONTH_LABELS_FR : MONTH_LABELS;

  return weeks.map((week, index) => {
    const firstDay = week.days.find((day) => day.date);

    if (!firstDay?.date) {
      return { index, label: '' };
    }

    const month = new Date(`${firstDay.date}T00:00:00Z`).getUTCMonth();
    const label = month !== previousMonth ? labels[month] : '';
    previousMonth = month;

    return { index, label };
  });
};

const formatContributionTitle = (date: string, count: number, language: Language) => {
  const formattedDate = new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));

  if (language === 'fr') {
    return `${count} contribution${count > 1 ? 's' : ''} - ${formattedDate}`;
  }

  return `${count} contribution${count === 1 ? '' : 's'} - ${formattedDate}`;
};

const ActiviteGithub: React.FC<ActiviteGithubProps> = ({ language }) => {
  const { user, summary, loading, error } = useGitHubData(GITHUB_USERNAME);
  const {
    weeks,
    total: contributionTotal,
    loading: contributionsLoading,
    error: contributionsError,
  } = useGitHubContributions(GITHUB_USERNAME);
  const contributionWeeks = contributionsLoading ? skeletonWeeks : weeks;
  const monthMarkers = useMemo(
    () => buildMonthMarkers(contributionWeeks, language),
    [contributionWeeks, language]
  );
  const dayLabels = DAY_LABELS[language];
  const visibleTotal = formatNumber(contributionTotal);
  const revealRef = useScrollReveal();

  return (
    <section ref={revealRef} id="activite" className="py-24 px-4 sm:px-6 bg-[#BDC3C7]/5 dark:bg-white/[0.01]">
      <div className="max-w-5xl mx-auto">

        {/* --- En-tête de la section --- */}
        <div className="github-reveal flex flex-col md:flex-row justify-between items-center mb-12 sm:mb-8 gap-6 sm:gap-8">
          <CapsuleDivider>
            {language === 'fr' ? 'Activité GitHub' : 'GitHub Activity'}
          </CapsuleDivider>

          {user && (
            <a
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#151621] dark:bg-white text-white dark:text-[#151621] px-6 py-3 rounded-full font-black text-xs sm:text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
            >
              <Github size={18} />
              <span>@{GITHUB_USERNAME}</span>
              <ExternalLink size={14} className="opacity-70" />
            </a>
          )}
        </div>

        <div className="flex flex-col gap-8">

            {/* --- 1. Carte Calendrier (Contributions) --- */}
            <div className="github-reveal bg-white dark:bg-[#151621] p-5 sm:p-8 lg:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5 flex flex-col h-full">
              <div className="flex items-center gap-4 sm:gap-6 mb-8">
                <div className="flex items-center gap-4 sm:gap-6">
                <div className="p-3 bg-[#151621] dark:bg-white text-white dark:text-[#151621] rounded-xl shadow-md">
                  <GitCommit size={24} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#151621] dark:text-white uppercase tracking-widest">
                    {language === 'fr' ? 'Contributions' : 'Contributions'}
                  </h3>
                  <p className="text-[#BDC3C7] dark:text-[#b8b2b0] text-xs font-black uppercase tracking-wider">
                    {language === 'fr' ? 'Dernière année' : 'Last year'}
                  </p>
                </div>
                </div>
              </div>

              <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-sm font-bold text-slate-500 dark:text-gray-400">
                  {contributionsLoading
                    ? (language === 'fr' ? 'Chargement du calendrier...' : 'Loading calendar...')
                    : contributionsError
                      ? (language === 'fr' ? 'Le calendrier public GitHub est momentanément indisponible.' : 'The public GitHub calendar is temporarily unavailable.')
                      : language === 'fr'
                        ? `${visibleTotal} contributions sur la dernière année`
                        : `${visibleTotal} contributions in the last year`}
                </p>
                <a
                  href={`https://github.com/users/${GITHUB_USERNAME}/contributions`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#b8b2b0] hover:text-[#151621] dark:hover:text-white transition-colors"
                >
                  {language === 'fr' ? 'Calendrier officiel' : 'Official calendar'}
                  <ExternalLink size={14} />
                </a>
              </div>

              <div className="rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-black/10 p-3 sm:p-5 overflow-hidden">
                <div className="w-full">
                <div className="w-full">
                  <div
                    className="grid gap-[3px] sm:gap-1 text-[9px] sm:text-[10px] font-medium text-slate-400"
                    style={{
                      gridTemplateColumns: `28px repeat(${contributionWeeks.length}, minmax(0, 1fr))`,
                      gridTemplateRows: '18px repeat(7, minmax(0, 1fr))',
                    }}
                  >
                    <div />
                    {monthMarkers.map(({ index, label }) => (
                      <span key={`month-${index}`} className="leading-none">
                        {label}
                      </span>
                    ))}

                    {Array.from({ length: 7 }, (_, dayIndex) => (
                      <React.Fragment key={`row-${dayIndex}`}>
                        <span className="leading-[13px] pr-1">
                          {dayIndex === 1 ? dayLabels[0] : dayIndex === 3 ? dayLabels[1] : dayIndex === 5 ? dayLabels[2] : ''}
                        </span>
                        {contributionWeeks.map((week, weekIndex) => {
                          const day = week.days[dayIndex];
                          const level = Math.max(0, Math.min(day?.level ?? 0, CONTRIBUTION_LEVELS.length - 1));
                          const isEmpty = !day?.date;

                          return (
                            <span
                              key={day?.date ?? `empty-${weekIndex}-${dayIndex}`}
                              title={
                                day?.date
                                  ? formatContributionTitle(day.date, day.count, language)
                                  : undefined
                              }
                              className={`block aspect-square w-full rounded-[2px] sm:rounded-[3px] border border-black/5 dark:border-white/10 ${contributionsLoading ? 'animate-pulse' : ''} ${isEmpty ? 'opacity-0' : ''}`}
                              style={{
                                backgroundColor: `var(--github-level-${level})`,
                              } as React.CSSProperties}
                              aria-label={day?.date ? formatContributionTitle(day.date, day.count, language) : undefined}
                            />
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>{language === 'fr' ? 'Moins' : 'Less'}</span>
                    {CONTRIBUTION_LEVELS.map((color, index) => (
                      <span
                        key={color}
                        className="block h-[12px] w-[12px] rounded-[3px] border border-black/5 dark:border-white/10"
                        style={{ backgroundColor: `var(--github-level-${index})` }}
                        aria-label={`Level ${index}`}
                      />
                    ))}
                    <span>{language === 'fr' ? 'Plus' : 'More'}</span>
                  </div>
                </div>
                </div>
              </div>

              {contributionsError && (
                <p className="mt-4 rounded-xl bg-red-50 dark:bg-red-500/10 px-4 py-3 text-xs font-bold text-red-600 dark:text-red-300">
                  {contributionsError}
                </p>
              )}
            </div>

            {/* --- 2. Grille Statistiques & Langages --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">

              {/* Carte Stats Globales */}
              <div className="github-reveal bg-white dark:bg-[#151621] p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5 flex flex-col h-full">
                <div className="flex items-center gap-4 ">
                  <div className="p-3 bg-[#151621] dark:bg-white text-white dark:text-[#151621] rounded-xl shadow-md">
                    <BarChart3 size={20} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-[#151621] dark:text-white uppercase tracking-widest">
                    {language === 'fr' ? 'Statistiques' : 'Global Stats'}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 py-6">
                  <MetricItem
                    icon={<BookOpen />}
                    label={language === 'fr' ? 'Dépôts' : 'Repos'}
                    value={loading ? '...' : formatNumber(summary.repoCount)}
                  />
                  <MetricItem
                    icon={<Star />}
                    label={language === 'fr' ? 'Étoiles' : 'Stars'}
                    value={loading ? '...' : formatNumber(summary.totalStars)}
                  />
                  <MetricItem
                    icon={<GitFork />}
                    label="Forks"
                    value={loading ? '...' : formatNumber(summary.totalForks)}
                  />
                  <MetricItem
                    icon={<Users />}
                    label={language === 'fr' ? 'Followers' : 'Followers'}
                    value={loading ? '...' : formatNumber(user?.followers ?? 0)}
                  />
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    {language === 'fr' ? 'Dernière activité publique' : 'Latest public activity'}
                  </p>
                  <p className="text-sm font-bold text-[#151621] dark:text-white">
                    {loading ? '...' : formatDate(summary.lastUpdatedAt, language)}
                  </p>
                  {error && (
                    <p className="mt-3 text-xs font-bold text-red-500">
                      {error}
                    </p>
                  )}
                </div>
              </div>

              {/* Carte Langages */}
              <div className="github-reveal bg-white dark:bg-[#151621] p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5 flex flex-col h-full">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#151621] dark:bg-white text-white dark:text-[#151621] rounded-xl shadow-md">
                    <PieChart size={20} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-[#151621] dark:text-white uppercase tracking-widest">
                    {language === 'fr' ? 'Langages' : 'Languages'}
                  </h3>
                </div>

                <div className="flex-grow py-6">
                  {loading ? (
                    <div className="animate-pulse">
                      <div className="mx-auto h-44 w-44 rounded-full bg-slate-100 dark:bg-white/10" />
                      <div className="mt-6 grid grid-cols-2 gap-3">
                        {Array.from({ length: 4 }, (_, index) => (
                          <div key={`language-skeleton-${index}`} className="h-5 rounded-full bg-slate-100 dark:bg-white/10" />
                        ))}
                      </div>
                    </div>
                  ) : summary.languages.length > 0 ? (
                    <>
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div
                          className="relative h-44 w-44 shrink-0 rounded-full shadow-inner"
                          style={{
                            background: `conic-gradient(${summary.languages
                              .map((item, index) => {
                                const previous = summary.languages
                                  .slice(0, index)
                                  .reduce((sum, languageItem) => sum + languageItem.percentage, 0);
                                return `${item.color} ${previous}% ${previous + item.percentage}%`;
                              })
                              .join(', ')})`,
                          }}
                          aria-label={language === 'fr' ? 'Répartition des langages' : 'Language distribution'}
                        >
                          <div className="absolute inset-5 rounded-full bg-white dark:bg-[#151621] flex flex-col items-center justify-center text-center">
                            <span className="text-3xl font-black text-[#151621] dark:text-white">
                              {summary.languages[0]?.percentage}%
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#b8b2b0]">
                              {summary.languages[0]?.name}
                            </span>
                          </div>
                        </div>

                        <div className="w-full grid grid-cols-1 gap-2">
                          {summary.languages.slice(0, 6).map((item) => (
                            <div key={item.name} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 dark:bg-white/5 px-4 py-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className="h-3 w-3 rounded-full shrink-0"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm font-black text-[#151621] dark:text-white truncate">
                                  {item.name}
                                </span>
                              </div>
                              <span className="text-xs font-black text-[#b8b2b0]">
                                {item.percentage}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm font-bold text-slate-400 text-center py-10">
                      {language === 'fr' ? 'Aucun langage détecté.' : 'No language data found.'}
                    </p>
                  )}
                </div>
              </div>

            </div>

          </div>
      </div>
    </section>
  );
};

export default ActiviteGithub;
