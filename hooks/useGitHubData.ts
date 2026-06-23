
import { useState, useEffect } from 'react';
import { GitHubRepo, GitHubUser } from '../types';

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

interface StaticGitHubProfile {
  username?: string;
  generatedAt?: string;
  user?: GitHubUser | null;
  repoCount: number;
  totalStars: number;
  totalForks: number;
  lastUpdatedAt: string | null;
  languages: GitHubLanguageStat[];
  repositories?: GitHubRepositoryStat[];
}

type RepoLanguageData = Record<string, number>;

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  CSS: '#663399',
  HTML: '#e34c26',
  PHP: '#4F5D95',
  'C#': '#178600',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Shell: '#89e051',
  SCSS: '#c6538c',
};

const EMPTY_SUMMARY: GitHubSummary = {
  repoCount: 0,
  totalStars: 0,
  totalForks: 0,
  lastUpdatedAt: null,
  languages: [],
};

function buildLanguageStats(repoLanguages: RepoLanguageData[]): GitHubLanguageStat[] {
  const totals = new Map<string, number>();

  repoLanguages.forEach((languages) => {
    Object.entries(languages).forEach(([name, bytes]) => {
      totals.set(name, (totals.get(name) ?? 0) + bytes);
    });
  });

  const totalBytes = Array.from(totals.values()).reduce((sum, bytes) => sum + bytes, 0);

  if (!totalBytes) {
    return [];
  }

  return Array.from(totals.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: Math.round((bytes / totalBytes) * 1000) / 10,
      color: LANGUAGE_COLORS[name] ?? '#b8b2b0',
    }));
}

function buildSummary(repos: GitHubRepo[], repoLanguages: RepoLanguageData[]): GitHubSummary {
  const ownedRepos = repos
    .filter((repo) => !repo.fork)
    .sort((a, b) => {
      const dateA = new Date(a.pushed_at ?? a.updated_at).getTime();
      const dateB = new Date(b.pushed_at ?? b.updated_at).getTime();
      return dateB - dateA;
    });

  return {
    repoCount: ownedRepos.length,
    totalStars: ownedRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
    totalForks: ownedRepos.reduce((sum, repo) => sum + repo.forks_count, 0),
    lastUpdatedAt: ownedRepos[0]?.pushed_at ?? ownedRepos[0]?.updated_at ?? null,
    languages: buildLanguageStats(repoLanguages),
  };
}

function hasUsableStaticProfile(data: StaticGitHubProfile, username: string) {
  const sameUser = !data.username || data.username.toLowerCase() === username.toLowerCase();
  return sameUser && Array.isArray(data.languages);
}

function buildSummaryFromStaticProfile(data: StaticGitHubProfile): GitHubSummary {
  return {
    repoCount: data.repoCount ?? 0,
    totalStars: data.totalStars ?? 0,
    totalForks: data.totalForks ?? 0,
    lastUpdatedAt: data.lastUpdatedAt ?? null,
    languages: data.languages ?? [],
  };
}

export function useGitHubData(username: string) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [repositoryStats, setRepositoryStats] = useState<GitHubRepositoryStat[]>([]);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [summary, setSummary] = useState<GitHubSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const staticResponse = await fetch(`${import.meta.env.BASE_URL}github-profile.json`, {
          cache: 'no-store',
          signal: controller.signal,
        });

        if (staticResponse.ok) {
          const staticData = await staticResponse.json() as StaticGitHubProfile;

          if (!isMounted) {
            return;
          }

          if (hasUsableStaticProfile(staticData, username)) {
            setUser(staticData.user ?? null);
            setRepos([]);
            setRepositoryStats(staticData.repositories ?? []);
            setSummary(buildSummaryFromStaticProfile(staticData));
            return;
          }
        }

        const [userRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${username}`, { signal: controller.signal }),
          fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=100&type=owner`, { signal: controller.signal })
        ]);

        if (!userRes.ok || !reposRes.ok) {
          throw new Error('Impossible de récupérer les données GitHub');
        }

        const userData = await userRes.json() as GitHubUser;
        const reposData = await reposRes.json() as GitHubRepo[];
        const repoLanguageData = await Promise.all(
          reposData
            .filter((repo) => !repo.fork && repo.languages_url)
            .map(async (repo) => {
              try {
                const response = await fetch(repo.languages_url, { signal: controller.signal });
                return response.ok ? await response.json() as RepoLanguageData : {};
              } catch {
                return {};
              }
            })
        );

        if (!isMounted) {
          return;
        }

        setUser(userData);
        setRepos(reposData);
        setRepositoryStats(
          reposData
            .filter((repo) => !repo.fork)
            .map((repo) => ({
              name: repo.name,
              htmlUrl: repo.html_url,
              primaryLanguage: repo.language,
              primaryLanguageColor: LANGUAGE_COLORS[repo.language ?? ''] ?? '#b8b2b0',
              stars: repo.stargazers_count,
              forks: repo.forks_count,
              commitCount: null,
              lastActivityAt: repo.pushed_at ?? repo.updated_at,
              visibility: 'public' as const,
            }))
        );
        setSummary(buildSummary(reposData, repoLanguageData));
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

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [username]);

  return { repos, repositoryStats, user, summary, loading, error };
}
