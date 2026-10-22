import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { unzipSync, strFromU8 } from 'fflate';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { login, openLesson, edit, saved, origin } from './helpers.js';
import { lessonById } from '../src/content/curriculum.js';
test('interactive HTML is isolated, responds to clicks and ignores injected scripts', async ({
  page,
  context,
}) => {
  await login(context, 'student2');
  await openLesson(page, 'skule-v1-dom-02');
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await edit(page, lessonById('skule-v1-dom-02').solution.js);
  await page.getByRole('button', { name: 'Køyr koden', exact: true }).click();
  await page.frameLocator('#preview').getByRole('button', { name: 'Trykk her' }).click();
  await expect(page.frameLocator('#preview').locator('#svar')).toHaveText('Du er på lista!');
  await page.getByRole('tab', { name: 'HTML', exact: true }).click();
  await edit(
    page,
    '<button id="knapp" onclick="parent.hacked=true">Trykk her</button><p id="svar">Vent</p><script>parent.hacked=true</script><img src="https://example.invalid/leak">',
  );
  await page.getByRole('button', { name: 'Køyr koden', exact: true }).click();
  await expect(page.frameLocator('#preview').locator('img')).toHaveCount(0);
  expect(await page.evaluate(() => window.hacked)).toBeUndefined();
  expect(errors).toEqual([]);
});
test('support changes preserve code, reset offers a copy, and offline work survives a new session', async ({
  page,
  context,
  browser,
}) => {
  await login(context, 'student3');
  await openLesson(page, 'skule-v1-start-02');
  await edit(page, 'circle(320,160,45,"blue"); // MY-WORK');
  await page.locator('#support').selectOption('help');
  await expect(page.locator('.cm-content')).toContainText('MY-WORK');
  await page.locator('#support').selectOption('challenge');
  await expect(page.locator('.cm-content')).toContainText('MY-WORK');
  await saved(page);
  await page.getByRole('button', { name: 'Start på nytt', exact: true }).click();
  await page.getByRole('button', { name: 'Hald fram med min kode' }).click();
  await expect(page.locator('.cm-content')).toContainText('MY-WORK');
  await context.setOffline(true);
  await edit(page, 'circle(320,160,45,"orange"); // OFFLINE');
  await expect(page.locator('#save-status')).toHaveText('Ikkje lagra');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Last ned kodekopi utan nett' }).click();
  const file = await download;
  expect(JSON.parse(await readFile(await file.path(), 'utf8')).data.files.js).toContain('OFFLINE');
  await context.setOffline(false);
  await saved(page);
  const other = await browser.newContext({ baseURL: origin });
  await login(other, 'student3');
  const next = await other.newPage();
  await openLesson(next, 'skule-v1-start-02');
  await expect(next.locator('.cm-content')).toContainText('OFFLINE');
  await other.close();
});
test('two machines show a revision conflict and preserve both versions', async ({
  page,
  context,
  browser,
}) => {
  await login(context, 'student4');
  await openLesson(page, 'skule-v1-start-01');
  await saved(page);
  const other = await browser.newContext({ baseURL: origin });
  await login(other, 'student4');
  const p = await other.newPage();
  await openLesson(p, 'skule-v1-start-01');
  await saved(p);
  await edit(page, 'print("MASKIN A");');
  await saved(page);
  await edit(p, 'print("MASKIN B");');
  await expect(p.locator('#save-status')).toHaveText('Lagringskonflikt');
  await p.getByRole('button', { name: 'Sjå begge versjonane' }).click();
  await expect(p.locator('dialog')).toContainText('MASKIN A');
  await expect(p.locator('dialog')).toContainText('MASKIN B');
  await p.getByRole('button', { name: 'Lagre mi utgåve vidare' }).click();
  await saved(p);
  const conflicts = await (await other.request.get('/api/conflicts')).json();
  expect(conflicts.records.some((r) => r.data.files.js.includes('MASKIN B'))).toBe(true);
  expect(conflicts.records.some((r) => r.serverVersion?.data.files.js.includes('MASKIN A'))).toBe(
    true,
  );
  await other.close();
});
test('logout clears the editor in every tab and another account sees only its work', async ({
  page,
  context,
}) => {
  await login(context, 'student5');
  await openLesson(page, 'skule-v1-start-01');
  await edit(page, 'print("PRIVATE-5");');
  await saved(page);
  const tab = await context.newPage();
  await openLesson(tab, 'skule-v1-start-01');
  await expect(tab.locator('.cm-content')).toContainText('PRIVATE-5');
  await page.bringToFront();
  await page.getByRole('button', { name: 'Logg ut' }).click();
  await expect(page.locator('.cm-content')).toHaveCount(0);
  await expect(tab.locator('.cm-content')).toHaveCount(0);
  await page.locator('summary').filter({ hasText: 'Fleire testkontoar' }).click();
  await page.locator('#test-account').selectOption('student10');
  await page.getByRole('button', { name: 'Opne testkonto' }).click();
  await page.getByRole('button', { name: '10. trinn', exact: true }).click();
  await page.getByRole('button', { name: 'Start med den første roboten' }).click();
  await expect(page.locator('.cm-content')).not.toContainText('PRIVATE-5');
});
test('logout waits for unsaved work in other tabs and refuses to discard it offline', async ({
  page,
  context,
}) => {
  await login(context, 'student5');
  await openLesson(page, 'skule-v1-start-06');
  await saved(page);
  const other = await context.newPage();
  await other.goto('/');
  await page.route('**/api/progress/**', (r) =>
    r.request().method() === 'PUT' ? r.abort() : r.continue(),
  );
  await edit(page, 'print("PENDING-IN-OTHER-TAB");');
  await expect(page.locator('#save-status')).toHaveText('Ikkje lagra');
  await other.getByRole('button', { name: 'Logg ut', exact: true }).click();
  await expect(other.locator('#notice')).toContainText('fane');
  await expect(page.locator('.cm-content')).toContainText('PENDING-IN-OTHER-TAB');
  await page.unroute('**/api/progress/**');
  await other.getByRole('button', { name: 'Logg ut', exact: true }).click();
  await expect(page.locator('.cm-content')).toHaveCount(0);
  await login(context, 'student5');
  const record = await (await context.request.get('/api/progress/skule-v1-start-06')).json();
  expect(record.data.files.js).toContain('PENDING-IN-OTHER-TAB');
});
test('unbounded student code stops, and a later run still works', async ({ page, context }) => {
  await login(context, 'student6');
  await openLesson(page, 'skule-v1-move-02');
  await edit(page, 'while(true) {}');
  await page.getByRole('button', { name: 'Køyr koden', exact: true }).click();
  await expect(page.locator('#runtime-error')).toContainText('stoppa');
  await edit(page, 'text("Frisk igjen", 40, 100);');
  await page.getByRole('button', { name: 'Køyr koden', exact: true }).click();
  await expect(page.locator('#run-status')).toHaveText('Køyrer');
  await page.getByRole('button', { name: 'Stopp', exact: true }).click();
  await expect(page.locator('#run-status')).toHaveText('Stoppa');
  await edit(page, 'onKey(function(){ throw Error("Feil i tastetrykket"); });');
  await page.getByRole('button', { name: 'Køyr koden', exact: true }).click();
  await expect(page.locator('#run-status')).toHaveText('Køyrer');
  await page.locator('#scene').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#runtime-error')).toContainText('Feil i tastetrykket');
});

test('ten pupils run code and save to Firestore concurrently without sharing work', async ({
  browser,
}) => {
  test.setTimeout(90000);
  const contexts = await Promise.all(
    Array.from({ length: 10 }, () => browser.newContext({ baseURL: origin })),
  );
  try {
    await Promise.all(
      contexts.map(async (context, i) => {
        await login(context, 'student' + (i + 1));
        const page = await context.newPage();
        await openLesson(page, 'skule-v1-start-05');
        await edit(page, 'print("ELEV-' + i + '"); circle(200,160,30,"blue");');
        await page.getByRole('button', { name: 'Køyr koden', exact: true }).click();
        await expect(page.locator('#run-status')).toHaveText('Køyrer');
        await saved(page);
        const result = await (await context.request.get('/api/progress/skule-v1-start-05')).json();
        expect(result.data.files.js).toContain('ELEV-' + i);
      }),
    );
  } finally {
    await Promise.all(contexts.map((c) => c.close()));
  }
});
test('all eight Snake steps share a project and its exported copy runs without a server', async ({
  page,
  context,
}) => {
  test.setTimeout(90000);
  await login(context, 'student7');
  await openLesson(page, 'skule-v1-snake-01');
  for (let i = 1; i <= 8; i++) {
    const lesson = lessonById('skule-v1-snake-0' + i);
    await edit(page, lesson.solution.js);
    await page.getByRole('button', { name: 'Sjekk koden', exact: true }).click();
    await expect(page.locator('#auto-result')).toContainText('Sjekken består');
    await saved(page);
    if (i < 8) {
      await page.getByRole('button', { name: 'Neste oppdrag' }).click();
      await expect(page.locator('.cm-content')).toContainText('let snake');
    }
  }
  const downloaded = page.waitForEvent('download');
  await page.locator('#export').click();
  const archive = unzipSync(await readFile(await (await downloaded).path()));
  expect(strFromU8(archive['elevkode.js'])).toContain('function restart');
  const dir = resolve('test-results/snake-export');
  await mkdir(dir, { recursive: true });
  for (const [name, bytes] of Object.entries(archive)) await writeFile(resolve(dir, name), bytes);
  const exported = await context.newPage();
  await exported.goto(pathToFileURL(resolve(dir, 'index.html')).href);
  await expect(exported.locator('#status')).toHaveText('Køyrer');
  await exported.locator('canvas').focus();
  await exported.keyboard.press('Space');
  await exported.getByRole('button', { name: 'Stopp', exact: true }).click();
  await expect(exported.locator('#status')).toHaveText('Stoppa');
});
test('teacher approval limits access and feedback reaches the right learner', async ({
  browser,
}) => {
  const tc = await browser.newContext({ baseURL: origin }),
    sc = await browser.newContext({ baseURL: origin });
  const teacher = await login(tc, 'teacher');
  await tc.request.put('/api/teacher/guide', {
    headers: { Origin: origin, 'X-CSRF-Token': teacher.csrf },
    data: { version: 1 },
  });
  await login(sc, 'student8');
  const t = await tc.newPage(),
    s = await sc.newPage();
  await t.goto('/');
  await t.getByRole('button', { name: 'Lærarrommet', exact: true }).click();
  await t.getByLabel('Gruppenamn').fill('9A – prøve');
  await t.getByRole('button', { name: 'Opprett gruppe', exact: true }).click();
  const groupCard = t.locator('#teacher-groups > section').filter({ hasText: '9A – prøve' });
  const code = await groupCard.locator('.code').textContent();
  await s.goto('/');
  await s.getByRole('button', { name: 'Mine grupper', exact: true }).click();
  await s.getByLabel('Gruppekode').fill(code);
  await s.getByRole('button', { name: 'Be om å bli med' }).click();
  await expect(s.locator('#group-list')).toContainText('Ventar på læraren');
  await t.getByRole('button', { name: 'Lærarrommet', exact: true }).click();
  await groupCard.getByRole('button', { name: 'Godkjenn', exact: true }).click();
  await openLesson(s, 'skule-v1-start-01');
  await s.getByLabel('Mi forklaring').fill('Fargen er det siste argumentet.');
  await saved(s);
  await groupCard.getByRole('button', { name: 'Sjå arbeid' }).click();
  await t.locator('.records summary').first().click();
  await expect(t.locator('#student-work')).toContainText('Fargen er det siste argumentet.');
  const review = t.locator('[data-review="skule-v1-start-01"]');
  await review.getByLabel('Lærarvurdering').fill('Fin forklaring. Prøv ein annan storleik òg.');
  await review.getByRole('button', { name: 'Lagre tilbakemelding' }).click();
  await openLesson(s, 'skule-v1-start-01');
  await expect(s.locator('.teacher-feedback')).toContainText('Fin forklaring.');
  await tc.close();
  await sc.close();
});
test('keyboard, contrast, narrow layout and reduced motion remain usable', async ({
  page,
  context,
}) => {
  await login(context, 'student9');
  await page.goto('/');
  await expect(page.locator('.module-card')).toHaveCount(8);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: 'test-results/home.png', fullPage: true });
  await openLesson(page, 'skule-v1-web-01');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.locator('.cm-content').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('#run')).toBeFocused();
  await page.screenshot({ path: 'test-results/workspace.png', fullPage: true });
  await page.setViewportSize({ width: 720, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: 'test-results/narrow.png', fullPage: true });
});
