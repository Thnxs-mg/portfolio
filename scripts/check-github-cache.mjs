import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify, isDeepStrictEqual } from 'node:util';

const exec = promisify(execFile);

function changedFields(cached, live) {
  return [...new Set([...Object.keys(cached), ...Object.keys(live)])]
    .filter(key => key !== 'generatedAt' && !isDeepStrictEqual(cached[key], live[key]));
}

if (process.argv.includes('--self-test')) {
  const cached = { generatedAt: 'old', total: 1, weeks: [{ count: 1 }] };
  assert.deepEqual(changedFields(cached, { ...cached, generatedAt: 'new' }), []);
  assert.deepEqual(changedFields(cached, { ...cached, total: 2 }), ['total']);
  assert.deepEqual(changedFields(cached, { ...cached, weeks: [{ count: 2 }] }), ['weeks']);
  assert.deepEqual(changedFields(cached, { total: 1 }), ['weeks']);
  assert.deepEqual(changedFields(cached, { ...cached, username: 'other' }), ['username']);
  console.log('5 vérifications réussies.');
} else {
  const directory = await mkdtemp(path.join(tmpdir(), 'portfolio-github-check-'));
  try {
    // Use the same authenticated source for both comparisons, including private activity.
    let token = process.env.GH_CONTRIBUTIONS_TOKEN || process.env.GITHUB_TOKEN
      || process.env.GH_TOKEN || process.env.GH_PROFILE_TOKEN;
    if (!token) token = (await exec('gh', ['auth', 'token'])).stdout.trim();
    if (!token) throw new Error('Authentification GitHub requise : gh auth login.');

    const results = await Promise.allSettled([
      ['profile', 'GITHUB_PROFILE_OUTPUT'],
      ['contributions', 'CONTRIBUTIONS_OUTPUT'],
    ].map(async ([name, outputVariable]) => {
      const filename = `github-${name}.json`;
      const output = path.join(directory, filename);
      await exec(process.execPath, [`scripts/fetch-github-${name}.mjs`], {
        env: { ...process.env, GITHUB_TOKEN: token, GH_PROFILE_TOKEN: token,
          GH_CONTRIBUTIONS_TOKEN: token, [outputVariable]: output },
        timeout: 120_000,
      });
      const [cached, live] = await Promise.all([
        readFile(path.join('public', filename), 'utf8').then(JSON.parse),
        readFile(output, 'utf8').then(JSON.parse),
      ]);
      const changes = changedFields(cached, live);
      console.log(`${filename} : ${changes.length ? 'À ACTUALISER' : 'IDENTIQUE À LA SOURCE GITHUB'}`);
      console.log(`  Copie locale générée le : ${cached.generatedAt ?? 'date inconnue'}`);
      if (changes.length) {
        console.log(`  Champs différents : ${changes.join(', ')}`);
        process.exitCode = 1;
      }
    }));
    for (const result of results) {
      if (result.status === 'rejected') {
        console.error(`VÉRIFICATION IMPOSSIBLE : ${result.reason.message}`);
        process.exitCode = 2;
      }
    }
    if (process.exitCode === 1) console.log('Pour actualiser : npm run fetch:github-data');
  } catch (error) {
    console.error(`VÉRIFICATION IMPOSSIBLE : ${error.message}`);
    process.exitCode = 2;
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
