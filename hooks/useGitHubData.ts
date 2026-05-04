
import { useState, useEffect } from 'react';
import { GitHubRepo, GitHubUser } from '../types';

export function useGitHubData(username: string) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // In a real app, use process.env.API_KEY if needed for rate limits
        // but public API works for simple fetch.
        const [userRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${username}`),
          fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`)
        ]);

        if (!userRes.ok || !reposRes.ok) {
          throw new Error('Impossible de récupérer les données GitHub');
        }

        const userData = await userRes.json();
        const reposData = await reposRes.json();

        setUser(userData);
        setRepos(reposData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  return { repos, user, loading, error };
}
