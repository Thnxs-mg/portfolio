import { useEffect, useState } from 'react';

interface StaticGitHubContributionsResponse {
  username?: string;
  generatedAt?: string | null;
  totalContributions: number;
  weeks: Array<{
    contributionDays: Array<{
      date: string;
      contributionCount: number;
      color: string;
      weekday?: number;
    }>;
  }>;
}

export interface GitHubContributionDay {
  date: string | null;
  count: number;
  level: number;
  isOutsideRange?: boolean;
}

export interface GitHubContributionWeek {
  days: GitHubContributionDay[];
}

const EMPTY_STATE = {
  weeks: [] as GitHubContributionWeek[],
  total: 0,
};

const COLOR_LEVELS = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];

const emptyDay = (): GitHubContributionDay => ({
  date: null,
  count: 0,
  level: 0,
  isOutsideRange: true,
});

function getUtcWeekday(date: string) {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

function getLevelFromColor(color: string) {
  const normalizedColor = color.toLowerCase();
  const index = COLOR_LEVELS.findIndex((levelColor) => levelColor === normalizedColor);
  return index === -1 ? 0 : index;
}

function mapStaticWeeks(data: StaticGitHubContributionsResponse): GitHubContributionWeek[] {
  return data.weeks.map((week) => {
    const days: GitHubContributionDay[] = Array.from({ length: 7 }, emptyDay);

    week.contributionDays.forEach((day) => {
      const weekday = typeof day.weekday === 'number' ? day.weekday : getUtcWeekday(day.date);
      const safeWeekday = Math.max(0, Math.min(weekday, 6));

      days[safeWeekday] = {
        date: day.date,
        count: day.contributionCount,
        level: getLevelFromColor(day.color),
      };
    });

    return { days };
  });
}

function hasUsableStaticData(data: StaticGitHubContributionsResponse, username: string) {
  if (!data || typeof data !== 'object') return false;
  const sameUser = !data.username || data.username.toLowerCase() === username.toLowerCase();
  return sameUser && Number.isFinite(data.totalContributions) && data.totalContributions >= 0
    && Array.isArray(data.weeks) && data.weeks.length > 0
    && data.weeks.every(week => Array.isArray(week.contributionDays) && week.contributionDays.every(day =>
      /^\d{4}-\d{2}-\d{2}$/.test(day.date) && Number.isFinite(Date.parse(`${day.date}T00:00:00Z`))
      && Number.isFinite(day.contributionCount) && day.contributionCount >= 0 && typeof day.color === 'string'
    ));
}

function normalizeStaticResponse(data: StaticGitHubContributionsResponse) {
  return {
    weeks: mapStaticWeeks(data),
    total: data.totalContributions ?? 0,
  };
}

export function useGitHubContributions(username: string) {
  const [weeks, setWeeks] = useState<GitHubContributionWeek[]>(EMPTY_STATE.weeks);
  const [total, setTotal] = useState(EMPTY_STATE.total);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const cacheKey = `github-contributions-${username}`;
    let latest: StaticGitHubContributionsResponse | null = null;
    const apply = (data: StaticGitHubContributionsResponse) => {
      if (!isMounted || !hasUsableStaticData(data, username)) return false;
      if (latest && (Date.parse(latest.generatedAt ?? '') || 0) > (Date.parse(data.generatedAt ?? '') || 0)) return false;
      latest = data;
      const result = normalizeStaticResponse(data);
      setWeeks(result.weeks);
      setTotal(result.total);
      setGeneratedAt(data.generatedAt ?? null);
      setLoading(false);
      try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch { /* Optional cache. */ }
      return true;
    };
    let fetching = false;
    const fetchContributions = async () => {
      if (fetching) return;
      fetching = true;
      setError(null);
      try {
        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached) apply(JSON.parse(cached));
        } catch { /* Storage can be blocked or contain an invalid value. */ }
        const response = await fetch(`${import.meta.env.BASE_URL}github-contributions.json`, {
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15_000)]), cache: 'no-store',
        });
        if (!response.ok) throw new Error('Impossible de récupérer les contributions GitHub');
        const data = await response.json() as StaticGitHubContributionsResponse;
        if (!hasUsableStaticData(data, username)) throw new Error('Calendrier GitHub invalide');
        apply(data);
      } catch (err) {
        if (!isMounted || controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        fetching = false;
        if (isMounted) setLoading(false);
      }
    };

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void fetchContributions();
    };
    void fetchContributions();
    const interval = window.setInterval(refreshWhenVisible, 15 * 60 * 1000);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      controller.abort();
    };
  }, [username]);

  return { weeks, total, generatedAt, loading, error };
}
