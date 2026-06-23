import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const username = process.env.GITHUB_USERNAME || 'Thnxs-mg';
const token = process.env.GH_CONTRIBUTIONS_TOKEN;
const outputPath = process.env.CONTRIBUTIONS_OUTPUT || 'public/github-contributions.json';
const contributionColors = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];

const query = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              color
              weekday
            }
          }
        }
      }
    }
  }
`;

async function fetchFromGraphQL() {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'portfolio-contributions-fetcher',
    },
    body: JSON.stringify({
      query,
      variables: { login: username },
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL request failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();

  if (result.errors?.length) {
    throw new Error(JSON.stringify(result.errors, null, 2));
  }

  const calendar = result.data?.user?.contributionsCollection?.contributionCalendar;

  if (!calendar) {
    throw new Error(`No contribution calendar found for ${username}.`);
  }

  return calendar;
}

async function fetchFromPublicFallback() {
  const response = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`
  );

  if (!response.ok) {
    throw new Error(`Public contribution fallback failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const weeks = [];

  for (const day of data.contributions ?? []) {
    const weekday = new Date(`${day.date}T00:00:00Z`).getUTCDay();

    if (weekday === 0 || weeks.length === 0) {
      weeks.push({ contributionDays: [] });
    }

    weeks[weeks.length - 1].contributionDays.push({
      date: day.date,
      contributionCount: day.count,
      color: contributionColors[Math.max(0, Math.min(day.level ?? 0, contributionColors.length - 1))],
      weekday,
    });
  }

  return {
    totalContributions: data.total?.lastYear ?? 0,
    weeks,
  };
}

const calendar = token ? await fetchFromGraphQL() : await fetchFromPublicFallback();

const payload = {
  username,
  generatedAt: new Date().toISOString(),
  totalContributions: calendar.totalContributions,
  weeks: calendar.weeks,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);

console.log(`Wrote ${calendar.totalContributions} contributions to ${outputPath}.`);
