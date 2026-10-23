import { test, expect } from '@playwright/test';
import { createHash } from 'node:crypto';
import { unzipSync } from 'fflate';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { login, openLesson, edit, saved } from './helpers.js';

test('HTML input keeps spaces and caret keys, and nested button content activates its handler', async ({
  page,
  context,
}) => {
  await login(context, 'student2');
  await openLesson(page, 'skule-v1-dom-01');
  await page.getByRole('tab', { name: 'HTML', exact: true }).click();
  await edit(
    page,
    '<input id="name"><button id="button"><span id="label">Vis namnet</span></button><p id="answer">Vent</p>',
  );
  await page.getByRole('tab', { name: 'JavaScript', exact: true }).click();
  await edit(
    page,
    'document.getElementById("button").addEventListener("click", e => { document.getElementById("answer").textContent = document.getElementById("name").value + ":" + e.target.id; });',
  );
  await page.getByRole('button', { name: 'Køyr koden', exact: true }).click();
  const frame = page.frameLocator('#preview');
  await frame.locator('#name').pressSequentially('Ada Lovelace');
  await expect(frame.locator('#name')).toHaveValue('Ada Lovelace');
  await frame.locator('#name').press('ArrowLeft');
  await frame.locator('#name').press('Backspace');
  await expect(frame.locator('#name')).toHaveValue('Ada Lovelae');
  await frame.locator('#label').click();
  await expect(frame.locator('#answer')).toHaveText('Ada Lovelae:label');
});

test('drawing export preserves selected mode even with retained HTML, across lessons and reload', async ({
  page,
  context,
}) => {
  await login(context, 'student3');
  await openLesson(page, 'skule-v1-project-01');
  await page.getByRole('tab', { name: 'HTML', exact: true }).click();
  await edit(page, '<!-- my game notes -->');
  await page.getByRole('tab', { name: 'JavaScript', exact: true }).click();
  await edit(page, 'rect(10,10,100,100,"blue"); print("MY GAME");');
  await page.locator('#result-kind').selectOption('web');
  await saved(page);
  await page.getByRole('button', { name: 'Neste oppdrag' }).click();
  await expect(page.locator('#result-kind')).toHaveValue('web');
  await page.locator('#result-kind').selectOption('draw');
  await saved(page);
  await openLesson(page, 'skule-v1-project-02');
  await expect(page.locator('#result-kind')).toHaveValue('draw');
  const downloaded = page.waitForEvent('download');
  await page.locator('#export').click();
  const archive = unzipSync(await readFile(await (await downloaded).path()));
  const dir = resolve('test-results/mixed-export');
  await mkdir(dir, { recursive: true });
  for (const [name, bytes] of Object.entries(archive)) await writeFile(resolve(dir, name), bytes);
  const exported = await context.newPage();
  await exported.goto(pathToFileURL(resolve(dir, 'index.html')).href);
  await expect(exported.locator('canvas')).toBeVisible();
  await expect(exported.locator('iframe')).toBeHidden();
  await expect(exported.locator('#output')).toContainText('MY GAME');
});

for (const mode of ['clean', 'dirty', 'offline-tab'])
  test(`expired session renews in place with ${mode}`, async ({ page, context }) => {
    const dirty = mode !== 'clean';
    const me = await login(context, 'student4');
    await openLesson(page, 'skule-v1-start-02');
    await saved(page);
    const tab = dirty ? await context.newPage() : null;
    if (tab) {
      await openLesson(tab, 'skule-v1-start-03');
      await saved(tab);
    }
    const cookie = (await context.cookies()).find((c) => c.name === 'schoolSession');
    const expired = await fetch(
      'http://127.0.0.1:8086/v1/projects/demo-school-e2e/databases/(default)/documents/sessions/' +
        createHash('sha256').update(cookie.value).digest('hex') +
        '?updateMask.fieldPaths=expires',
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { expires: { integerValue: '1' } } }),
      },
    );
    expect(expired.ok).toBe(true);
    if (dirty) {
      await edit(page, 'print("PENDING PRIMARY ' + mode + '");');
      await edit(tab, 'print("PENDING SECOND TAB ' + mode + '");');
      await expect(page.locator('#save-status')).toHaveText('Ikkje lagra');
      await expect(tab.locator('#save-status')).toHaveText('Ikkje lagra');
    } else await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    if (mode === 'offline-tab') await tab.route('**/api/**', (r) => r.abort());
    await page.getByRole('button', { name: 'Logg inn på nytt', exact: true }).click();
    await page.getByRole('button', { name: 'Hald fram som Elev 4', exact: true }).click();
    await expect(page.locator('.cm-content')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logg inn på nytt', exact: true })).toBeHidden();
    await saved(page);
    expect((await (await context.request.get('/api/me')).json()).user.id).toBe(me.user.id);
    if (dirty) {
      if (mode === 'offline-tab') {
        await expect(tab.locator('#notice')).toContainText('Ingen kontakt');
        await tab.unroute('**/api/**');
        await tab.evaluate(() => window.dispatchEvent(new Event('online')));
      }
      await saved(tab);
      await expect(page.locator('.cm-content')).toContainText('PENDING PRIMARY');
      await expect(tab.locator('.cm-content')).toContainText('PENDING SECOND TAB');
      for (const [id, value] of [
        ['02', 'PENDING PRIMARY'],
        ['03', 'PENDING SECOND TAB'],
      ]) {
        const record = await (
          await context.request.get('/api/progress/skule-v1-start-' + id)
        ).json();
        expect(record.data.files.js).toContain(value);
      }
    }
    await page.getByRole('button', { name: 'Logg ut', exact: true }).click();
    await expect(page.locator('.cm-content')).toHaveCount(0);
  });
