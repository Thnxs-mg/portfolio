import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = '/home/thnxs/my_pc/project';
const OUT = join(process.cwd(), 'public', 'project-analysis.json');
const IGNORED = new Set(['wallet_thnxs', 'node_modules', 'dist', '.git']);
const ASSET_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.svg', '.webp', '.ico']);
const MANIFEST_NAMES = new Set(['package.json', 'requirements.txt', 'pyproject.toml', 'vite.config.ts', 'vite.config.js', 'manage.py', 'docker-compose.yml']);

const stackByDependency = new Map([
  ['react', 'React'],
  ['react-dom', 'React'],
  ['react-router-dom', 'React Router'],
  ['vite', 'Vite'],
  ['typescript', 'TypeScript'],
  ['tailwindcss', 'Tailwind CSS'],
  ['@tailwindcss/vite', 'Tailwind CSS'],
  ['framer-motion', 'Framer Motion'],
  ['motion', 'Motion'],
  ['recharts', 'Recharts'],
  ['@mui/material', 'MUI'],
  ['@tanstack/react-query', 'React Query'],
  ['zustand', 'Zustand'],
  ['express', 'Express'],
  ['prisma', 'Prisma'],
  ['@prisma/client', 'Prisma'],
  ['socket.io', 'Socket.IO'],
  ['@google/genai', 'Google GenAI'],
]);

const readJson = (file) => {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
};

const listFiles = (dir, depth = 0, maxDepth = 4) => {
  if (depth > maxDepth || IGNORED.has(basename(dir))) return [];
  let entries = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }

  return entries.flatMap((entry) => {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) return listFiles(fullPath, depth + 1, maxDepth);
    return fullPath;
  });
};

const gitInfo = (dir) => {
  try {
    const lastCommit = execFileSync('git', ['-C', dir, 'log', '-1', '--format=%cI %s'], { encoding: 'utf8' }).trim();
    const dirty = execFileSync('git', ['-C', dir, 'status', '--short'], { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean).length;
    return { lastCommit, dirtyFiles: dirty };
  } catch {
    return null;
  }
};

const detectStack = (files) => {
  const stack = new Set();

  for (const file of files) {
    const name = basename(file);
    if (name === 'manage.py') stack.add('Django');
    if (name === 'requirements.txt') {
      const requirements = readFileSync(file, 'utf8').toLowerCase();
      if (requirements.includes('django')) stack.add('Django');
      if (requirements.includes('djangorestframework')) stack.add('Django REST Framework');
      if (requirements.includes('psycopg')) stack.add('PostgreSQL');
    }
    if (name === 'package.json') {
      const pkg = readJson(file);
      const deps = { ...pkg?.dependencies, ...pkg?.devDependencies };
      Object.keys(deps).forEach((dep) => {
        const label = stackByDependency.get(dep);
        if (label) stack.add(label);
      });
    }
    if (name.toLowerCase().includes('prisma')) stack.add('Prisma');
  }

  return [...stack].sort();
};

const detectVisualAssets = (files, projectDir) => {
  return files
    .filter((file) => ASSET_EXTENSIONS.has(extname(file).toLowerCase()))
    .filter((file) => !file.includes(`${projectDir}/dist/`) && !file.includes(`${projectDir}/node_modules/`))
    .map((file) => ({
      path: relative(projectDir, file),
      score:
        /logo|favicon|brand|icon/i.test(file) ? 3 :
        /dashboard|screen|preview|hero|background/i.test(file) ? 2 :
        1,
    }))
    .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path))
    .slice(0, 8);
};

const detectFeatures = (files, projectDir) => {
  const sourceNames = files.map((file) => relative(projectDir, file).toLowerCase());
  const features = [];
  const addIf = (condition, label) => condition && features.push(label);

  addIf(sourceNames.some((name) => /auth|login|jwt|password|users?/.test(name)), 'Authentication / users');
  addIf(sourceNames.some((name) => /stock|inventory|lot|movement/.test(name)), 'Stock / inventory');
  addIf(sourceNames.some((name) => /vente|sale|cash|invoice|facture|payment/.test(name)), 'Sales / billing');
  addIf(sourceNames.some((name) => /booking|reservation|room|chambre|calendar|planning/.test(name)), 'Planning / booking');
  addIf(sourceNames.some((name) => /dashboard|analytics|chart|recharts|stats|chiffre/.test(name)), 'Dashboard / analytics');
  addIf(sourceNames.some((name) => /import|export|xlsx|pdf|csv/.test(name)), 'Imports / exports');
  addIf(sourceNames.some((name) => /upload|media|asset/.test(name)), 'Uploads / media');

  return [...new Set(features)];
};

const projects = readdirSync(ROOT)
  .filter((entry) => !IGNORED.has(entry))
  .map((entry) => join(ROOT, entry))
  .filter((path) => statSync(path).isDirectory())
  .map((projectDir) => {
    const files = listFiles(projectDir);
    const readmes = files.filter((file) => basename(file).toLowerCase() === 'readme.md').map((file) => relative(projectDir, file));
    const manifests = files.filter((file) => MANIFEST_NAMES.has(basename(file))).map((file) => relative(projectDir, file));

    return {
      name: basename(projectDir),
      path: projectDir,
      stack: detectStack(files),
      features: detectFeatures(files, projectDir),
      readmes,
      manifests,
      visualAssets: detectVisualAssets(files, projectDir),
      git: gitInfo(projectDir),
    };
  });

mkdirSync(join(process.cwd(), 'public'), { recursive: true });
writeFileSync(OUT, `${JSON.stringify({ generatedAt: new Date().toISOString(), projects }, null, 2)}\n`);
console.log(`Analyzed ${projects.length} projects -> ${OUT}`);
