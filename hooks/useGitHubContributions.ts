import { useEffect, useState } from 'react';

interface GitHubContributionDayResponse {
  date: string;
  count: number;
  level: number;
}

interface GitHubContributionsResponse {
  total: {
    lastYear: number;
  };
  contributions: GitHubContributionDayResponse[];
}

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

function groupByWeek(contributions: GitHubContributionDayResponse[]): GitHubContributionWeek[] {
  const sortedDays = [...contributions].sort((a, b) => a.date.localeCompare(b.date));
  const weeks: GitHubContributionWeek[] = [];

  sortedDays.forEach((day) => {
    const weekday = getUtcWeekday(day.date);

    if (weekday === 0 || weeks.length === 0) {
      weeks.push({ days: [] });
    }

    weeks[weeks.length - 1].days[weekday] = {
      date: day.date,
      count: day.count,
      level: day.level,
    };
  });

  return weeks.map((week) => ({
    days: Array.from({ length: 7 }, (_, index) => week.days[index] ?? {
      date: null,
      count: 0,
      level: 0,
      isOutsideRange: true,
    }),
  }));
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
  const sameUser = !data.username || data.username.toLowerCase() === username.toLowerCase();
  return sameUser && Array.isArray(data.weeks) && data.weeks.length > 0;
}

function normalizeFallbackResponse(data: GitHubContributionsResponse) {
  return {
    weeks: groupByWeek(data.contributions ?? []),
    total: data.total?.lastYear ?? 0,
  };
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchContributions = async () => {
      try {
        setLoading(true);
        setError(null);

        const staticResponse = await fetch(`${import.meta.env.BASE_URL}github-contributions.json`, {
          cache: 'no-store',
          signal: controller.signal,
        });

        if (staticResponse.ok) {
          const staticData = await staticResponse.json() as StaticGitHubContributionsResponse;

          if (!isMounted) {
            return;
          }

          if (hasUsableStaticData(staticData, username)) {
            const result = normalizeStaticResponse(staticData);
            setWeeks(result.weeks);
            setTotal(result.total);
            return;
          }
        }

        const response = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('Impossible de récupérer les contributions GitHub');
        }

        const data = await response.json() as GitHubContributionsResponse;

        if (!isMounted) {
          return;
        }

        const result = normalizeFallbackResponse(data);
        setWeeks(result.weeks);
        setTotal(result.total);
      } catch (err) {
        if (isMounted) {
          if (err instanceof DOMException && err.name === 'AbortError') {
            return;
          }

          setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchContributions();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [username]);

  return { weeks, total, loading, error };
}
