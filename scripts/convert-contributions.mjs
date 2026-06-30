import { readFileSync, writeFileSync } from 'node:fs';

const contributionColors = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];

// Read raw API data
const rawData = JSON.parse(readFileSync('/tmp/raw-contributions.json', 'utf-8'));

const weeks = [];
let currentWeek = null;

for (const day of rawData.contributions) {
  const date = new Date(day.date + 'T00:00:00Z');
  const weekday = date.getUTCDay();

  // Start new week on Sunday (0)
  if (weekday === 0) {
    currentWeek = { contributionDays: [] };
    weeks.push(currentWeek);
  } else if (!currentWeek) {
    // First week of the year doesn't start on Sunday
    currentWeek = { contributionDays: [] };
    weeks.push(currentWeek);
  }

  currentWeek.contributionDays.push({
    date: day.date,
    contributionCount: day.count,
    color: contributionColors[Math.max(0, Math.min(day.level, contributionColors.length - 1))],
    weekday
  });
}

const payload = {
  username: 'Thnxs-mg',
  generatedAt: new Date().toISOString(),
  totalContributions: rawData.total['2026'] || 0,
  weeks
};

writeFileSync('public/github-contributions.json', JSON.stringify(payload, null, 2) + '\n');
console.log(`Wrote ${payload.totalContributions} contributions (${weeks.length} weeks) to public/github-contributions.json`);

// Show date range
const firstDate = weeks[0]?.contributionDays[0]?.date;
const lastDate = weeks[weeks.length - 1]?.contributionDays[6]?.date;
console.log(`Date range: ${firstDate} to ${lastDate}`);