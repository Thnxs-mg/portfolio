import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

function validate(profile, calendar) {
  assert.equal(profile.username, calendar.username);
  assert.equal(profile.user.login.toLowerCase(), profile.username.toLowerCase());
  for (const data of [profile, calendar]) assert.ok(Number.isFinite(Date.parse(data.generatedAt)));
  for (const key of ['repoCount', 'privateRepoCount', 'publicRepoCount', 'totalStars', 'totalForks']) {
    assert.ok(Number.isInteger(profile[key]) && profile[key] >= 0, key);
  }
  assert.equal(profile.repoCount, profile.privateRepoCount + profile.publicRepoCount);
  assert.equal(profile.repositories.length, profile.publicRepoCount);
  assert.ok(profile.repositories.every(repo => repo.visibility === 'public'));
  assert.ok(profile.languages.every(language => Number.isFinite(language.bytes) && language.bytes >= 0
    && Number.isFinite(language.percentage) && language.percentage >= 0 && language.percentage <= 100));
  const days = calendar.weeks.flatMap(week => week.contributionDays);
  assert.ok(days.length > 0);
  assert.equal(new Set(days.map(day => day.date)).size, days.length);
  for (const day of days) {
    assert.match(day.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(Number.isInteger(day.contributionCount) && day.contributionCount >= 0);
    assert.equal(day.weekday, new Date(`${day.date}T00:00:00Z`).getUTCDay());
    assert.match(day.color, /^#[0-9a-f]{6}$/i);
  }
  assert.equal(calendar.totalContributions, days.reduce((sum, day) => sum + day.contributionCount, 0));
  assert.equal(days.at(-1).date, calendar.generatedAt.slice(0, 10));
}

if (process.argv.includes('--snapshots')) {
  validate(JSON.parse(await readFile('public/github-profile.json', 'utf8')),
    JSON.parse(await readFile('public/github-contributions.json', 'utf8')));
  console.log('Snapshots valides : totaux, calendrier et confidentialité.');
} else {
  const directory = await mkdtemp(path.join(tmpdir(), 'portfolio-github-test-'));
  try {
    const mock = path.join(directory, 'mock.mjs');
    await writeFile(mock, `
      globalThis.fetch = async (url) => {
        if (process.env.TEST_FAILURE) return new Response('Unavailable', { status: 503 });
        if (url.endsWith('/graphql')) {
          const date = new Date().toISOString().slice(0, 10);
          return Response.json({ data: { user: { contributionsCollection: { contributionCalendar: {
            totalContributions: 3, weeks: [{ contributionDays: [{ date, contributionCount: 3,
              weekday: new Date(date + 'T00:00:00Z').getUTCDay(), color: '#40c463' }] }]
          } } } } });
        }
        if (url.includes('/users/')) return Response.json({ login: 'example' });
        if (url.includes('/user/repos?')) return Response.json([false, true].map(privateRepo => ({
          name: privateRepo ? 'confidential-project' : 'public-project', private: privateRepo,
          owner: { login: 'example' }, fork: false, pushed_at: '2026-01-01T00:00:00Z',
          language: 'JavaScript', languages_url: 'https://api.github.com/languages',
          stargazers_count: 0, forks_count: 0, html_url: 'https://github.com/example/' + (privateRepo ? 'confidential-project' : 'public-project')
        })));
        if (url.endsWith('/languages')) return Response.json({ JavaScript: 100 });
        throw new Error('Unexpected URL: ' + url);
      };
    `);
    const outputs = ['profile', 'contributions'].map(name => path.join(directory, `${name}.json`));
    const env = { ...process.env, GITHUB_USERNAME: 'example', GITHUB_TOKEN: 'test-only',
      GH_CONTRIBUTIONS_TOKEN: 'test-only', GH_PROFILE_TOKEN: 'test-only',
      GITHUB_PROFILE_OUTPUT: outputs[0], CONTRIBUTIONS_OUTPUT: outputs[1] };
    for (const name of ['profile', 'contributions']) {
      execFileSync(process.execPath, ['--import', mock, `scripts/fetch-github-${name}.mjs`], { env, stdio: 'pipe' });
    }
    const [profileText, calendarText] = await Promise.all(outputs.map(file => readFile(file, 'utf8')));
    const profile = JSON.parse(profileText);
    const calendar = JSON.parse(calendarText);
    validate(profile, calendar);
    assert.equal(profile.repoCount, 2);
    assert.equal(profile.privateRepoCount, 1);
    assert.ok(!profileText.includes('confidential-project'), 'Private names and URLs must never be exported');
    for (const [index, name] of ['profile', 'contributions'].entries()) {
      assert.throws(() => execFileSync(process.execPath,
        ['--import', mock, `scripts/fetch-github-${name}.mjs`],
        { env: { ...env, TEST_FAILURE: '1' }, stdio: 'pipe' }));
      assert.equal(await readFile(outputs[index], 'utf8'), index === 0 ? profileText : calendarText);
    }
    assert.throws(() => validate({ ...profile, repoCount: -1 }, calendar));
    assert.throws(() => validate(profile, { ...calendar, totalContributions: 99 }));
    console.log('Collecte, confidentialité, validation et conservation en cas de panne : OK.');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
