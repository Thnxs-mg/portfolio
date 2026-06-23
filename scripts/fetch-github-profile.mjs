import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const username = process.env.GITHUB_USERNAME || 'Thnxs-mg';
const outputPath = process.env.GITHUB_PROFILE_OUTPUT || 'public/github-profile.json';
const languageColors = {
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
  PLpgSQL: '#336791',
  Dockerfile: '#384d54',
  Batchfile: '#C1F12E',
  PowerShell: '#012456',
};

function getToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  if (process.env.GH_PROFILE_TOKEN) return process.env.GH_PROFILE_TOKEN;

  try {
    return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

async function githubFetch(url, token) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'portfolio-github-profile-fetcher',
    },
  });

  if (!response.ok) {
    throw new Error(`${url} failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function githubFetchWithHeaders(url, token) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'portfolio-github-profile-fetcher',
    },
  });

  if (!response.ok) {
    throw new Error(`${url} failed: ${response.status} ${response.statusText}`);
  }

  return response;
}

async function fetchAllPages(url, token) {
  const items = [];
  let page = 1;

  while (true) {
    const separator = url.includes('?') ? '&' : '?';
    const data = await githubFetch(`${url}${separator}per_page=100&page=${page}`, token);

    if (!Array.isArray(data) || data.length === 0) break;

    items.push(...data);
    if (data.length < 100) break;
    page += 1;
  }

  return items;
}

function getLastPageFromLink(linkHeader) {
  if (!linkHeader) return null;

  const match = linkHeader.match(/[?&]page=(\d+)>;\s*rel="last"/);
  return match ? Number(match[1]) : null;
}

async function fetchCommitCount(repo, token) {
  if (!repo.default_branch) return null;

  try {
    const url = `https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits?sha=${encodeURIComponent(repo.default_branch)}&per_page=1`;
    const response = await githubFetchWithHeaders(url, token);
    const data = await response.json();
    const lastPage = getLastPageFromLink(response.headers.get('link'));

    if (lastPage) return lastPage;
    return Array.isArray(data) ? data.length : null;
  } catch {
    return null;
  }
}

function buildLanguageStats(languageTotals) {
  const totalBytes = Array.from(languageTotals.values()).reduce((sum, bytes) => sum + bytes, 0);

  if (!totalBytes) return [];

  return Array.from(languageTotals.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: Math.round((bytes / totalBytes) * 1000) / 10,
      color: languageColors[name] ?? '#b8b2b0',
    }));
}

const token = getToken();

if (!token) {
  console.error('Missing GitHub token. Set GITHUB_TOKEN/GH_TOKEN/GH_PROFILE_TOKEN or run gh auth login.');
  process.exit(1);
}

const [user, repos] = await Promise.all([
  githubFetch(`https://api.github.com/users/${encodeURIComponent(username)}`, token),
  fetchAllPages(
    `https://api.github.com/user/repos?visibility=all&affiliation=owner&sort=pushed&direction=desc`,
    token
  ),
]);

const ownedRepos = repos.filter((repo) => repo.owner?.login?.toLowerCase() === username.toLowerCase() && !repo.fork);
const languageTotals = new Map();

for (const repo of ownedRepos) {
  if (!repo.languages_url) continue;

  const languages = await githubFetch(repo.languages_url, token);

  Object.entries(languages).forEach(([name, bytes]) => {
    languageTotals.set(name, (languageTotals.get(name) ?? 0) + bytes);
  });
}

const sortedByActivity = [...ownedRepos].sort((a, b) => {
  const dateA = new Date(a.pushed_at ?? a.updated_at).getTime();
  const dateB = new Date(b.pushed_at ?? b.updated_at).getTime();
  return dateB - dateA;
});

const repositories = await Promise.all(sortedByActivity.map(async (repo) => {
  const languages = repo.languages_url ? await githubFetch(repo.languages_url, token) : {};
  const primaryLanguage = repo.language ?? Object.entries(languages).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;

  return {
    name: repo.name,
    htmlUrl: repo.html_url,
    primaryLanguage,
    primaryLanguageColor: languageColors[primaryLanguage] ?? '#b8b2b0',
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    commitCount: await fetchCommitCount(repo, token),
    lastActivityAt: repo.pushed_at ?? repo.updated_at ?? null,
    visibility: repo.private ? 'private' : 'public',
  };
}));

const payload = {
  username,
  generatedAt: new Date().toISOString(),
  user: {
    login: user.login,
    avatar_url: user.avatar_url,
    public_repos: user.public_repos,
    followers: user.followers,
    following: user.following,
    bio: user.bio,
    html_url: user.html_url,
  },
  repoCount: ownedRepos.length,
  privateRepoCount: ownedRepos.filter((repo) => repo.private).length,
  publicRepoCount: ownedRepos.filter((repo) => !repo.private).length,
  totalStars: ownedRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
  totalForks: ownedRepos.reduce((sum, repo) => sum + repo.forks_count, 0),
  lastUpdatedAt: sortedByActivity[0]?.pushed_at ?? sortedByActivity[0]?.updated_at ?? null,
  languages: buildLanguageStats(languageTotals),
  repositories,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);

console.log(`Wrote GitHub profile stats for ${payload.repoCount} repositories to ${outputPath}.`);
