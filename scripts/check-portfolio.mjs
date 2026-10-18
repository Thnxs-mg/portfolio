import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';

// Uses the same browser CLI as visual QA; start Vite before running this check.
const url = process.env.PORTFOLIO_URL || 'http://127.0.0.1:3000';
const session = `portfolio-check-${Date.now()}`;
const run = (command, ...args) => {
  const result = spawnSync('npx', ['--yes', '--package', '@playwright/cli', 'playwright-cli', `-s=${session}`, command, ...args], {
    encoding: 'utf8', timeout: 120_000, cwd: tmpdir(),
  });
  assert.equal(result.status, 0, result.stderr || result.stdout || result.error?.message);
  assert.ok(!result.stdout.includes('### Error'), result.stdout);
  return result.stdout;
};

async function smoke(page) {
  // Functional checks should not wait on the external font CDN.
  await page.context().route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
  await page.goto(page.url(), { waitUntil: 'domcontentloaded' });
  const checks = [];
  const check = (condition, name) => {
    if (!condition) throw new Error(name);
    checks.push(name);
  };
  await page.setViewportSize({ width: 1440, height: 1000 });
  const title = page.locator('.cinema-stage-info h2');
  await title.waitFor();
  await page.getByRole('button', { name: 'Projet suivant', exact: true }).click();
  check(await title.textContent() === 'SPAT Dashboard', 'Next selects SPAT');
  await page.getByRole('button', { name: 'Projet suivant', exact: true }).click();
  check(await title.textContent() === 'Blue Hotel Management', 'Next wraps to first project');
  await page.getByRole('button', { name: 'Projet précédent', exact: true }).click();
  check(await title.textContent() === 'SPAT Dashboard', 'Previous wraps to last project');
  await page.locator('.cinema-film-item').nth(1).click();
  await page.locator('.cinema-stage-info').getByRole('link').click();
  const details = page.getByRole('dialog', { name: 'Cyber Aurora Management' });
  await details.waitFor();
  check(await details.getByRole('link', { name: 'Voir le projet', exact: true }).getAttribute('href') ===
    'https://aurora-management-demo.rd-jasonchris.workers.dev/', 'Aurora demo URL preserved');
  await page.keyboard.press('Tab');
  check(await details.evaluate(element => element.contains(document.activeElement)), 'Dialog contains keyboard focus');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('dialog[open]'));
  check(!page.url().includes('project='), 'Escape closes details and clears query');
  await page.goBack();
  await page.waitForFunction(() => location.pathname === '/');
  await page.locator('.cinema-stage-info').getByRole('link').click();
  await details.waitFor();
  await page.goBack();
  await page.waitForFunction(() => location.pathname === '/' && !document.querySelector('dialog[open]'));
  checks.push('Browser back closes project overlay');
  await page.locator('.cinema-actions').getByRole('link', { name: 'Voir mes Projets', exact: true }).click();

  await page.getByRole('button', { name: 'Filtrer', exact: true }).click();
  const filters = page.getByRole('dialog');
  await filters.getByRole('button', { name: 'Django', exact: true }).click();
  check(await filters.getByRole('button', { name: 'Django', exact: true }).getAttribute('aria-pressed') === 'true', 'Accessible filter state');
  await filters.getByRole('button', { name: /Voir les résultats/ }).click();
  check(await page.locator('.cinema-project-entry').count() === 2, 'Django matches two projects');
  await page.getByRole('button', { name: /Filtrer/ }).click();
  await page.getByRole('button', { name: 'Réinitialiser', exact: true }).click();
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('dialog[open]'));
  check(await page.locator('.cinema-project-entry').count() === 3, 'Reset restores all projects');
  await page.locator('.cinema-project-entry').nth(1).focus();
  await page.keyboard.press('Enter');
  await details.waitFor();
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.activeElement?.classList.contains('cinema-project-entry'));
  checks.push('Keyboard opens details and restores focus');
  await page.getByRole('button', { name: 'FR', exact: true }).click();
  check(await page.locator('html').getAttribute('lang') === 'en', 'English document language');
  check(await page.locator('h1:visible').textContent() === 'Realized Projects', 'English content');
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await page.getByRole('link', { name: 'Accueil', exact: true }).click();
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(350);
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No overflow at ${width}px`);
  }
  await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
  check(await page.getByRole('link', { name: 'Projets', exact: true }).isVisible(), 'Mobile menu opens');
  await page.keyboard.press('Escape');
  check(await page.getByRole('button', { name: 'Ouvrir le menu' }).getAttribute('aria-expanded') === 'false', 'Escape closes mobile menu');
  await page.getByRole('button', { name: 'Changer le thème' }).filter({ visible: true }).click();
  check(await page.locator('html').evaluate(element => !element.classList.contains('dark')), 'Light theme');
  await page.getByRole('button', { name: 'Changer le thème' }).filter({ visible: true }).click();
  check(await page.locator('html').evaluate(element => element.classList.contains('dark')), 'Dark theme');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.cinema-stage-panel')).transform === 'none');
  check(await page.locator('.cinema-stage-art').evaluate(element => getComputedStyle(element).transform === 'none'), 'Reduced motion removes parallax');
  check(await page.locator('.cinema-stage-panel').evaluate(element => getComputedStyle(element).transform === 'none'), 'Reduced motion removes pointer tilt');
  const nav = page.locator('.cinema-nav');
  const expectActive = async (href, name) => {
    await page.waitForFunction(expected => {
      const active = [...document.querySelectorAll('.cinema-nav a[aria-current]')]
        .filter(link => link.getBoundingClientRect().width > 0);
      return active.length === 1 && active[0].getAttribute('href') === expected;
    }, href, { timeout: 6000 }).catch(async error => { throw new Error(`${name}: ${await nav.locator('a[aria-current]').first().getAttribute('href')} (${error.message})`); });
    if (await page.locator('.cinema-nav-indicator').isVisible()) {
      await page.waitForFunction(() => {
        const active = document.querySelector('.cinema-nav a[aria-current]');
        const pill = document.querySelector('.cinema-nav-indicator');
        const a = active.getBoundingClientRect(), p = pill.getBoundingClientRect();
        return Math.abs(a.left + a.width / 2 - p.left - p.width / 2) < 1 && Math.abs(a.width - p.width) < 1;
      });
    }
    checks.push(name);
  };
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForFunction(() => !matchMedia('(prefers-reduced-motion: reduce)').matches);
  for (const theme of ['light', 'dark']) {
    if (await page.locator('html').evaluate(el => el.classList.contains('dark')) !== (theme === 'dark')) {
      await nav.getByRole('button', { name: 'Changer le thème' }).filter({ visible: true }).click();
    }
    await nav.getByRole('link', { name: 'Compétences', exact: true }).click();
    await expectActive('#skills', `${theme}: scroll activates skills and centers indicator`);
    await nav.getByRole('link', { name: 'Projets', exact: true }).click();
    await expectActive('/realisations', `${theme}: projects replaces previous section`);
    check(await page.locator('.cinema-nav-indicator').evaluate(el => getComputedStyle(el).backgroundColor) === (theme === 'dark' ? 'rgb(69, 183, 170)' : 'rgb(18, 100, 93)'), `${theme}: visible petrol indicator`);
    check(await nav.locator('a[aria-current] > span').evaluate(el => getComputedStyle(el).color) === (theme === 'dark' ? 'rgb(21, 22, 33)' : 'rgb(255, 255, 255)'), `${theme}: contrasting active text`);
    await page.goBack();
    await expectActive('#home', `${theme}: browser back resets home`);
    await page.goForward();
    await expectActive('/realisations', `${theme}: browser forward activates projects`);
    await nav.getByRole('link', { name: 'Contact', exact: true }).click();
    await expectActive('#contact', `${theme}: cross-route navigation activates contact`);
    await page.evaluate(() => { const el = document.getElementById('about'); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 90, behavior: 'instant' }); });
    await expectActive('#about', `${theme}: manual scroll updates active section`);
  }
  await nav.getByRole('link', { name: 'Projets', exact: true }).click();
  await page.reload();
  await expectActive('/realisations', 'Direct project load activates projects');
  await nav.getByRole('button', { name: 'FR', exact: true }).click();
  await expectActive('/realisations', 'Translated labels keep indicator aligned');
  await nav.getByRole('button', { name: 'EN', exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await nav.getByRole('button', { name: 'Ouvrir le menu' }).click();
  await expectActive('/realisations', 'Mobile menu activates projects');
  await nav.getByRole('link', { name: 'À Propos', exact: true }).click();
  await page.waitForTimeout(400);
  await nav.getByRole('button', { name: 'Ouvrir le menu' }).click();
  await expectActive('#about', 'Mobile cross-route navigation activates about');
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.waitForTimeout(350);
  const resizedSection = await page.evaluate(() => {
    let current = 'home';
    for (const id of ['home', 'about', 'skills', 'activite', 'contact']) {
      if (document.getElementById(id).getBoundingClientRect().top <= 130) current = id;
    }
    return `#${current}`;
  });
  await expectActive(resizedSection, 'Desktop indicator follows actual section after mobile resize');
  return { passed: checks.length, checks };
}

async function motionChecks(page) {
  const checks = [];
  const check = (condition, name) => { if (!condition) throw new Error(name); checks.push(name); };
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.reload();
  await page.locator('.cinema-name .cinema-word').first().waitFor();
  await page.waitForTimeout(1100);
  check(await page.locator('.cinema-name .cinema-word').count() === 2, 'Hero word masks preserve two-word title');
  const scrollTo = async id => page.evaluate(id => {
    const el = document.getElementById(id);
    scrollTo({ top: el.getBoundingClientRect().top + scrollY - 95, behavior: 'instant' });
  }, id);
  await scrollTo('about');
  await page.waitForFunction(() => document.querySelector('#about .cinema-word').getAnimations().length > 0, null, { timeout: 5000 }).catch(() => { throw new Error('About reveal did not start'); });
  const before = await page.locator('#about').evaluate(el => ({ height: el.offsetHeight, top: el.offsetTop }));
  await page.waitForTimeout(1000);
  check(await page.locator('#about').evaluate((el, before) => el.offsetHeight === before.height && el.offsetTop === before.top, before), 'Title reveal causes no layout shift');
  await scrollTo('contact');
  await page.waitForTimeout(100);
  await scrollTo('about');
  await page.waitForTimeout(100);
  check(await page.locator('#about').evaluate(el => el.getAnimations({ subtree: true }).length === 0), 'Viewed section does not replay');
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.reload();
  await page.locator('#skills [role="progressbar"]').first().waitFor({ state: 'attached' });
  await scrollTo('skills');
  await page.waitForFunction(() => document.querySelector('#skills [role="progressbar"]').getAnimations().length > 0, null, { timeout: 5000 }).catch(() => { throw new Error('Skill bar reveal did not start'); });
  check(await page.locator('#skills [role="progressbar"]').first().getAttribute('aria-valuenow') === '85', 'Animated bar keeps accessible final value');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => document.querySelector('#skills').getAnimations({ subtree: true }).length === 0);
  check(await page.locator('#skills [role="progressbar"]').first().evaluate(el => getComputedStyle(el).transform === 'none'), 'Reduced motion cancels running bar reveals');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await scrollTo('home');
  const cta = page.locator('.cinema-actions .cinema-button');
  await cta.hover();
  await page.waitForTimeout(300);
  const box = await cta.boundingBox();
  await page.mouse.move(box.x + box.width * 0.75, box.y + box.height / 2);
  await page.waitForTimeout(350);
  check(await cta.locator('.cinema-button-content').evaluate(el => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(el).transform);
    return Math.abs(matrix.m41) <= 3 && Math.abs(matrix.m42) <= 3 && Math.abs(matrix.m41) > 0.1;
  }), 'Magnetic feedback stays within 3px');
  const movedBox = await cta.boundingBox();
  check(Math.abs(box.x - movedBox.x) < 0.1 && Math.abs(box.y - movedBox.y) < 0.1, 'Magnet keeps the hit area stable');
  await page.locator('.cinema-nav a[href="/realisations"]').click();
  await page.locator('.cinema-project-entry').first().waitFor();
  await page.waitForTimeout(1100);
  await page.locator('.cinema-project-entry').first().hover();
  await page.waitForTimeout(350);
  check(await page.locator('.cinema-project-entry img').first().evaluate(el => Math.abs(new DOMMatrixReadOnly(getComputedStyle(el).transform).a - 1.025) < 0.001), 'Project hover zoom is subtle');
  await page.locator('.cinema-project-entry').first().click();
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  check(await page.locator('dialog').evaluate(el => el.dataset.closing === 'true' && document.body.style.overflow === 'hidden'), 'Modal exit keeps background locked');
  await page.waitForFunction(() => !document.querySelector('dialog[open]'));
  check(await page.evaluate(() => document.body.style.overflow === ''), 'Modal exit releases background lock');
  await page.locator('.cinema-nav').getByRole('link', { name: 'Accueil', exact: true }).click();
  await page.waitForTimeout(350);
  check(await page.locator('.cinema-name .cinema-word').first().evaluate(el => getComputedStyle(el).transform === 'none'), 'Route return does not replay hero');
  const context = await page.context().browser().newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  try {
    await context.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
    const touch = await context.newPage();
    touch.on('pageerror', error => errors.push(error.message));
    await touch.addInitScript(() => { window.IntersectionObserver = undefined; });
    await touch.goto(page.url());
    await touch.locator('#about .portfolio-reveal').first().waitFor({ state: 'attached' });
    check(await touch.locator('#about .portfolio-reveal').evaluateAll(elements => elements.every(el => getComputedStyle(el).opacity === '1')), 'Content stays visible if reveal observer is unavailable');
    await touch.getByRole('button', { name: 'Ouvrir le menu' }).click();
    await touch.getByRole('link', { name: 'Projets', exact: true }).click();
    await touch.locator('.cinema-project-entry').first().click();
    await touch.getByRole('dialog').waitFor();
    await touch.keyboard.press('Escape');
    await touch.waitForFunction(() => !document.querySelector('dialog[open]'));
    check(await touch.locator('.cinema-project-entry img').first().evaluate(el => getComputedStyle(el).transform === 'none'), 'Touch avoids sticky project zoom without reduced motion');
    await touch.locator('.cinema-project-entry').first().click();
    await touch.getByRole('dialog').waitFor();
    await touch.emulateMedia({ reducedMotion: 'reduce' });
    await touch.keyboard.press('Escape');
    await touch.waitForFunction(() => !document.querySelector('dialog[open]'));
    check(await touch.locator('.cinema-project-entry img').first().evaluate(el => getComputedStyle(el).transform === 'none'), 'Touch avoids sticky project zoom');
    check(await touch.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Motion preserves mobile width');
  } finally { await context.close(); }
  check(errors.length === 0, `No runtime errors: ${errors.join(', ')}`);
  return { passed: checks.length, checks };
}

async function introChecks(page) {
  const checks = [];
  const check = (condition, name) => { if (!condition) throw new Error(name); checks.push(name); };
  const browser = page.context().browser();
  const base = new URL('/', page.url()).href;
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  try {
    await context.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
    const tab = await context.newPage();
    tab.on('pageerror', error => errors.push(error.message));
    await tab.goto(base, { waitUntil: 'domcontentloaded' });
    await tab.locator('.jc-intro').waitFor();
    check(await tab.locator('.jc-intro-letter').allTextContents().then(letters => letters.join('')) === 'JC', 'Intro uses JC identity');
    check(await tab.locator('.cinema-nav').count() === 0, 'Portfolio entrance waits for intro completion');
    await tab.locator('.cinema-nav').waitFor({ timeout: 5000 });
    check(await tab.evaluate(() => sessionStorage.getItem('portfolio:intro-seen')) === '1', 'Intro records completed session');
    await tab.reload({ waitUntil: 'domcontentloaded' });
    await tab.locator('.cinema-nav').waitFor();
    check(await tab.locator('.jc-intro').count() === 0, 'Reload does not replay intro in same tab');
    await tab.locator('.cinema-nav').getByRole('link', { name: 'Projets', exact: true }).click();
    await tab.locator('.cinema-project-entry').first().waitFor();
    check(await tab.locator('.jc-intro').count() === 0, 'Route changes do not replay intro');
    await tab.evaluate(() => sessionStorage.removeItem('portfolio:intro-seen'));
    await tab.goto(`${base}realisations?project=aurora-management-v2`, { waitUntil: 'domcontentloaded' });
    await tab.getByRole('button', { name: 'Passer l’introduction' }).click();
    await tab.getByRole('dialog', { name: 'Cyber Aurora Management' }).waitFor();
    checks.push('Direct project link opens its modal after intro');
    await tab.keyboard.press('Escape');
    await tab.waitForFunction(() => !document.querySelector('dialog[open]'));
    await tab.evaluate(() => sessionStorage.removeItem('portfolio:intro-seen'));
    await tab.goto(base, { waitUntil: 'domcontentloaded' });
    await tab.locator('.jc-intro').waitFor();
    await tab.keyboard.press('Escape');
    await tab.locator('.cinema-nav').waitFor();
    check(await tab.locator('.jc-intro').count() === 0, 'Escape skips introduction');
    await tab.evaluate(() => sessionStorage.removeItem('portfolio:intro-seen'));
    await tab.reload({ waitUntil: 'domcontentloaded' });
    await tab.getByRole('button', { name: 'Passer l’introduction' }).click();
    await tab.locator('.cinema-nav').waitFor();
    check(await tab.locator('.jc-intro').count() === 0, 'Skip button opens portfolio');
    await tab.evaluate(() => sessionStorage.removeItem('portfolio:intro-seen'));
    await tab.reload({ waitUntil: 'domcontentloaded' });
    await tab.locator('.jc-intro').waitFor();
    await tab.addStyleTag({ content: '.jc-intro, .jc-intro * { animation: none !important; }' });
    await tab.locator('.cinema-nav').waitFor({ timeout: 5000 });
    checks.push('Fallback releases portfolio when animation events are unavailable');
    await tab.evaluate(() => sessionStorage.removeItem('portfolio:intro-seen'));
    await tab.reload({ waitUntil: 'domcontentloaded' });
    await tab.locator('.jc-intro').waitFor();
    await tab.emulateMedia({ reducedMotion: 'reduce' });
    await tab.locator('.cinema-nav').waitFor();
    check(await tab.locator('.jc-intro').count() === 0, 'Changing reduced-motion preference dismisses intro');
    await tab.evaluate(() => sessionStorage.removeItem('portfolio:intro-seen'));
    await tab.reload({ waitUntil: 'domcontentloaded' });
    await tab.locator('.cinema-nav').waitFor();
    check(await tab.locator('.jc-intro').count() === 0, 'Initial reduced-motion preference bypasses intro');
    await tab.emulateMedia({ reducedMotion: 'no-preference' });
    await tab.addInitScript(() => Object.defineProperty(window, 'sessionStorage', { get() { throw new DOMException('Storage unavailable', 'SecurityError'); } }));
    await tab.goto(base, { waitUntil: 'domcontentloaded' });
    await tab.locator('.jc-intro').waitFor();
    await tab.locator('.cinema-nav').waitFor({ timeout: 5000 });
    checks.push('Unavailable session storage does not block portfolio');
    check(errors.length === 0, `No intro runtime errors: ${errors.join(', ')}`);
  } finally { await context.close(); }
  return { passed: checks.length, checks };
}

async function transitionChecks(page) {
  const checks = [];
  const check = (condition, name) => { if (!condition) throw new Error(name); checks.push(name); };
  const idle = () => page.waitForFunction(() => {
    const host = document.querySelector('.cinema-page');
    return host && !host.dataset.transitioning && document.querySelector('[data-displayed-page]')?.dataset.displayedPage === location.pathname;
  }, null, { timeout: 6000 });
  const nav = page.locator('.cinema-nav');
  const go = async name => {
    if (page.viewportSize().width < 1024 && await nav.getByRole('button', { name: 'Ouvrir le menu' }).count()) {
      await nav.getByRole('button', { name: 'Ouvrir le menu' }).click();
    }
    await nav.getByRole('link', { name, exact: true }).filter({ visible: true }).click();
    await idle();
  };
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(new URL('/', page.url()).href, { waitUntil: 'domcontentloaded' });
  await page.locator('.cinema-nav').waitFor();
  await go('Accueil');
  await page.locator('#contact').waitFor({ state: 'attached' });
  await page.evaluate(() => { const el = document.getElementById('contact'); scrollTo({ top: el.getBoundingClientRect().top + scrollY - 80, behavior: 'instant' }); });
  const samples = await page.evaluate(async () => {
    const result = [], initialY = scrollY;
    document.querySelector('.cinema-nav a[href="/realisations"]').click();
    for (let i = 0; i < 35; i++) {
      await new Promise(requestAnimationFrame);
      const host = document.querySelector('.cinema-page');
      result.push({ initialY, y: scrollY, alpha: Number(getComputedStyle(host).opacity), path: document.querySelector('[data-displayed-page]').dataset.displayedPage,
        home: document.getElementById('home').getClientRects().length > 0, projects: document.querySelector('.cinema-projects').getClientRects().length > 0 });
    }
    return result;
  });
  await idle();
  check(samples.every(frame => Number(frame.home) + Number(frame.projects) === 1), 'Transition never displays both pages together');
  check(samples.filter(frame => frame.path === '/' && frame.alpha > 0.05).every(frame => Math.abs(frame.y - frame.initialY) < 1), 'Outgoing page keeps its scroll position until covered');
  check(samples.some(frame => frame.path === '/realisations') && samples.filter(frame => frame.path === '/realisations').every(frame => frame.y === 0), 'Destination is positioned before its reveal');
  check(await page.locator('.cinema-page').evaluate(el => getComputedStyle(el).opacity === '1' && getComputedStyle(el).transform === 'none'), 'Settled page has no residual transform or opacity');
  await page.getByRole('button', { name: 'Filtrer', exact: true }).click();
  await page.getByRole('button', { name: 'Django', exact: true }).click();
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('dialog[open]'));
  await go('Contact');
  check(await page.locator('#contact').evaluate(el => Math.abs(el.getBoundingClientRect().top - 80) < 2), 'Cross-route contact lands at navbar offset');
  await go('Projets');
  check(await page.locator('.cinema-project-entry').count() === 2, 'Project filters survive page transitions');
  await go('Accueil');
  await page.locator('.cinema-stage-info .cinema-text-link').click();
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('dialog[open]'));
  await idle();
  check(await page.locator('.cinema-page').evaluate(el => getComputedStyle(el).opacity === '1'), 'Closing a deep-linked modal does not cancel the page entrance');
  await go('Accueil');
  await page.evaluate(async () => {
    for (const href of ['/realisations', '#contact', '/realisations', '#about', '/realisations']) {
      document.querySelector(`.cinema-nav a[href="${href}"]`).click();
      await new Promise(resolve => setTimeout(resolve, 25));
    }
  });
  await idle();
  check(await page.locator('.cinema-projects').isVisible() && !await page.locator('#home').isVisible(), 'Rapid navigation settles on the latest route');
  await go('Accueil');
  await page.evaluate(async () => {
    document.querySelector('.cinema-nav a[href="/realisations"]').click();
    await new Promise(resolve => setTimeout(resolve, 25));
    document.querySelector('.cinema-nav a[href="#contact"]').click();
  });
  await idle();
  check(await page.locator('#contact').evaluate(el => Math.abs(el.getBoundingClientRect().top - 80) < 2), 'Interrupted route change still honors requested home section');
  await page.evaluate(() => { history.pushState({}, '', '/page-introuvable'); dispatchEvent(new PopStateEvent('popstate')); });
  await idle();
  check(await page.getByRole('heading', { name: 'Page introuvable', exact: true }).isVisible(), '404 participates in the same transition');
  await go('Accueil');
  await page.setViewportSize({ width: 390, height: 844 });
  await go('Projets');
  check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile project transition has no horizontal overflow');
  await go('Contact');
  check(await page.locator('#contact').evaluate(el => Math.abs(el.getBoundingClientRect().top - 80) < 2), 'Mobile cross-route contact is positioned correctly');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await nav.getByRole('link', { name: 'Projets', exact: true }).click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await idle();
  check(await page.locator('.cinema-page').evaluate(el => getComputedStyle(el).transform === 'none' && el.getAnimations().length === 0), 'Reduced motion cancels spatial page transitions cleanly');
  return { passed: checks.length, checks };
}

assert.ok((await fetch(url)).ok, 'Start the portfolio server first');
try {
  run('open', url);
  console.log(run('run-code', smoke.toString()));
  console.log(run('run-code', motionChecks.toString()));
  console.log(run('run-code', introChecks.toString()));
  console.log(run('run-code', transitionChecks.toString()));
} finally {
  run('close');
}
