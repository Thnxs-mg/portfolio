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
  return !data.username || data.username.toLowerCase() === username.toLowerCase();
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
  const [contributionWeeks] = useState<GitHubContributionWeek[]>([]);
  const [contributionTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contributionsError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const cacheKey = `github-data-${username}`;

    const applyStaticData = (data: StaticGitHubData) => {
      setUser(data.user ?? null);
      setRepositoryStats(data.repositories ?? []);
      setSummary(toSummary(data));
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const cachedData = JSON.parse(cached) as StaticGitHubData;
            if (isCurrentUser(cachedData, username) && isMounted) {
              applyStaticData(cachedData);
              setLoading(false);
            }
          } catch {
            localStorage.removeItem(cacheKey);
          }
        }

        const staticData = await fetchJson<StaticGitHubData>(
          `${import.meta.env.BASE_URL}github-profile.json`,
          controller.signal
        );

        if (!isMounted) return;

        if (isCurrentUser(staticData, username)) {
          applyStaticData(staticData);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(staticData));
          } catch {
            // Non-critical: localStorage can be unavailable or full.
          }
        }
      } catch (err) {
        if (!isMounted || (err instanceof DOMException && err.name === 'AbortError')) return;
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [username]);

  return {
    repos,
    repositoryStats,
    user,
    summary,
    contributionWeeks,
    contributionTotal,
    loading,
    error,
    contributionsError,
  };
}
