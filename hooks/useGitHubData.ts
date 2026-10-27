import { useEffect, useState } from 'react';
import type { GitHubRepo, GitHubUser } from '../types';

interface GitHubLanguageStat {
  name: string;
  bytes: number;
  percentage: number;
  color: string;
}

interface GitHubSummary {
  repoCount: number;
  totalStars: number;
  totalForks: number;
  lastUpdatedAt: string | null;
  languages: GitHubLanguageStat[];
}

export interface GitHubRepositoryStat {
  name: string;
  htmlUrl: string;
  primaryLanguage: string | null;
  primaryLanguageColor: string;
  stars: number;
  forks: number;
  commitCount: number | null;
  lastActivityAt: string | null;
  visibility: 'public' | 'private';
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

interface StaticGitHubData {
  username?: string;
  generatedAt?: string;
  user?: GitHubUser | null;
  repoCount?: number;
  totalStars?: number;
  totalForks?: number;
  lastUpdatedAt?: string | null;
  languages?: GitHubLanguageStat[];
  repositories?: GitHubRepositoryStat[];
}

const EMPTY_SUMMARY: GitHubSummary = {
  repoCount: 0,
  totalStars: 0,
  totalForks: 0,
  lastUpdatedAt: null,
  languages: [],
};

function isCurrentUser(data: StaticGitHubData, username: string) {
  return !!data && typeof data === 'object' && !!data.user
    && (!data.username || data.username.toLowerCase() === username.toLowerCase());
}

function toSummary(data: StaticGitHubData): GitHubSummary {
  return {
    repoCount: data.repoCount ?? data.repositories?.length ?? 0,
    totalStars: data.totalStars ?? 0,
    totalForks: data.totalForks ?? 0,
    lastUpdatedAt: data.lastUpdatedAt ?? null,
    languages: data.languages ?? [],
  };
}

async function fetchJson<T>(url: string, signal: AbortSignal, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, signal });

  if (!response.ok) {
    throw new Error(`${url} failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function useGitHubData(username: string) {
  const [repos] = useState<GitHubRepo[]>([]);
  const [repositoryStats, setRepositoryStats] = useState<GitHubRepositoryStat[]>([]);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [summary, setSummary] = useState<GitHubSummary>(EMPTY_SUMMARY);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [contributionWeeks] = useState<GitHubContributionWeek[]>([]);
  const [contributionTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contributionsError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const cacheKey = `github-data-${username}`;
    let latestTimestamp = 0;

    const applyStaticData = (data: StaticGitHubData) => {
      const timestamp = Date.parse(data.generatedAt ?? '') || 0;
      if (!isCurrentUser(data, username) || timestamp < latestTimestamp) return;
      latestTimestamp = timestamp;
      setUser(data.user ?? null);
      setRepositoryStats(data.repositories ?? []);
      setSummary(toSummary(data));
      setGeneratedAt(data.generatedAt ?? null);
      try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch { /* Optional cache. */ }
    };

    let fetching = false;
    const fetchData = async () => {
      if (fetching) return;
      fetching = true;
      try {
        setError(null);

        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const cachedData = JSON.parse(cached) as StaticGitHubData;
            if (isCurrentUser(cachedData, username) && isMounted) {
              applyStaticData(cachedData);
              setLoading(false);
            }
          }
        } catch { /* Storage can be blocked or contain an invalid value. */ }

        const staticData = await fetchJson<StaticGitHubData>(
          `${import.meta.env.BASE_URL}github-profile.json`,
          AbortSignal.any([controller.signal, AbortSignal.timeout(15_000)]),
          { cache: 'no-store' }
        );

        if (!isMounted) return;

        if (!isCurrentUser(staticData, username)) throw new Error('Profil GitHub invalide');
        applyStaticData(staticData);
      } catch (err) {
        if (!isMounted || (err instanceof DOMException && err.name === 'AbortError')) return;
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        fetching = false;
        if (isMounted) setLoading(false);
      }
    };

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void fetchData();
    };
    void fetchData();
    const interval = window.setInterval(refreshWhenVisible, 15 * 60 * 1000);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      isMounted = false;
      controller.abort();
    };
  }, [username]);

  return {
    repos,
    repositoryStats,
    user,
    summary,
    generatedAt,
    contributionWeeks,
    contributionTotal,
    loading,
    error,
    contributionsError,
  };
}
