import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { login, origin } from './helpers.js';

test('teacher guide opens at login, can be deferred, completed and reopened', async ({
  page,
  context,
  browser,
}) => {
  await login(context, 'teacher2');
  await page.goto('/');
  const guide = page.getByRole('dialog', { name: 'Lærarguiden' });
  await expect(guide).toBeVisible();
  await expect(guide).toContainText('Steg 1 av 6');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: 'test-results/teacher-guide-desktop.png', fullPage: true });
  await page.keyboard.press('Escape');
  await expect(guide).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Opne lærarguiden' })).toBeFocused();
  await page.reload();
  await expect(guide).toBeVisible();
  await page.setViewportSize({ width: 390, height: 740 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (let i = 1; i < 6; i++) {
    await expect(guide).toContainText(`Steg ${i} av 6`);
    await guide.getByRole('button', { name: 'Neste steg' }).click();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: 'test-results/teacher-guide.png', fullPage: true });
  await guide.getByRole('button', { name: 'Fullfør innføringa' }).click();
  await expect(guide).not.toBeVisible();
  await expect(page.getByLabel('Gruppenamn')).toBeFocused();
  const second = await browser.newContext({ baseURL: origin });
  try {
    await login(second, 'teacher2');
    const p = await second.newPage();
    await p.goto('/');
    await expect(p.getByRole('heading', { name: 'Lærarrommet', exact: true })).toBeVisible();
    await expect(p.getByRole('dialog')).toHaveCount(0);
    await expect(p.getByRole('button', { name: 'Mine grupper', exact: true })).toHaveCount(0);
    await p.getByRole('button', { name: 'Opne lærarguiden' }).click();
    await expect(p.getByRole('dialog', { name: 'Lærarguiden' })).toContainText('Steg 1 av 6');
  } finally {
    await second.close();
  }
});

test('teacher guide keeps the last step open when saving fails', async ({ page, context }) => {
  await login(context, 'teacher');
  await page.goto('/');
  const guide = page.getByRole('dialog', { name: 'Lærarguiden' });
  await expect(guide).toBeVisible();
  for (let i = 0; i < 5; i++) await guide.getByRole('button', { name: 'Neste steg' }).click();
  await page.route('**/api/teacher/guide', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Prøv igjen. Innføringa er ikkje lagra.' }),
    }),
  );
  await guide.getByRole('button', { name: 'Fullfør innføringa' }).click();
  await expect(guide.getByRole('alert')).toContainText('ikkje lagra');
  await expect(guide).toBeVisible();
  expect((await (await context.request.get('/api/me')).json()).user.teacherGuideVersion || 0).toBe(
    0,
  );
  await page.unroute('**/api/teacher/guide');
  await guide.getByRole('button', { name: 'Fullfør innføringa' }).click();
  await expect(guide).not.toBeVisible();
});

test('teacher refreshes membership and keeps unsaved feedback through failures and navigation', async ({
  page,
  context,
  browser,
}) => {
  const teacher = await login(context, 'teacher');
  await context.request.put('/api/teacher/guide', {
    headers: { Origin: origin, 'X-CSRF-Token': teacher.csrf },
    data: { version: 1 },
  });
  const sc = await browser.newContext({ baseURL: origin });
  try {
    const student = await login(sc, 'student6');
    await sc.request.put('/api/progress/skule-v1-start-01', {
      headers: { Origin: origin, 'X-CSRF-Token': student.csrf },
      data: {
        revision: 0,
        data: {
          files: { js: 'print("hei");', html: '', css: '' },
          reflection: '<img src=x onerror=alert(1)>',
          support: 'help',
          selfChecked: false,
          autoPassed: true,
        },
      },
    });
    await page.goto('/');
    await page.getByLabel('Gruppenamn').fill('Tilbakemelding og oppdatering');
    await page.getByRole('button', { name: 'Opprett gruppe', exact: true }).click();
    const card = page
      .locator('#teacher-groups > section')
      .filter({ hasText: 'Tilbakemelding og oppdatering' });
    const code = await card.locator('.code').textContent();
    await sc.request.post('/api/groups/join', {
      headers: { Origin: origin, 'X-CSRF-Token': student.csrf },
      data: { code },
    });
    await page.getByRole('button', { name: 'Oppdater elevlistene' }).click();
    await card.getByRole('button', { name: 'Godkjenn', exact: true }).click();
    await card.getByRole('button', { name: 'Sjå arbeid' }).click();
    await page.locator('.records summary').first().click();
    const form = page.locator('[data-review="skule-v1-start-01"]');
    await expect(page.locator('#student-work .preserve')).toHaveText(
      '<img src=x onerror=alert(1)>',
    );
    await expect(page.locator('#student-work img')).toHaveCount(0);
    await form.getByLabel('Lærarvurdering').fill('Forklar kva print gjer.');
    await page.getByRole('button', { name: 'Verkstaden', exact: true }).click();
    await expect(page.locator('#notice')).toContainText('ulagrede tilbakemeldingar');
    await expect(form.getByLabel('Lærarvurdering')).toHaveValue('Forklar kva print gjer.');
    await page.getByRole('button', { name: 'Logg ut', exact: true }).click();
    await expect(form.getByLabel('Lærarvurdering')).toHaveValue('Forklar kva print gjer.');
    await page.route('**/api/groups/*/reviews/**', (route) => route.abort('failed'));
    await form.getByRole('button', { name: 'Lagre tilbakemelding' }).click();
    await expect(form.getByRole('status')).toContainText('Ikkje lagra');
    await page.unroute('**/api/groups/*/reviews/**');
    await form.getByRole('button', { name: 'Lagre tilbakemelding' }).click();
    await expect(form.getByRole('status')).toContainText('Tilbakemelding lagra');
    await expect(page.locator('#notice')).toBeHidden();
    expect(
      (await (await sc.request.get('/api/reviews')).json()).records.some(
        (r) => r.note === 'Forklar kva print gjer.',
      ),
    ).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.screenshot({ path: 'test-results/teacher-room.png', fullPage: true });
    const groups = (await (await context.request.get('/api/groups')).json()).groups;
    const group = groups.find((g) => g.code === code);
    await context.request.put(
      `/api/groups/${group.id}/reviews/${student.user.id}/skule-v1-start-01`,
      {
        headers: { Origin: origin, 'X-CSRF-Token': teacher.csrf },
        data: { note: 'Frå ei anna maskin.', revision: 1 },
      },
    );
    await form.getByLabel('Lærarvurdering').fill('Mi nyare tilbakemelding.');
    await form.getByRole('button', { name: 'Lagre tilbakemelding', exact: true }).click();
    await expect(form.locator('[data-review-conflict]')).toContainText('Frå ei anna maskin.');
    await expect(form.getByLabel('Lærarvurdering')).toHaveValue('Mi nyare tilbakemelding.');
    await form.getByRole('button', { name: 'Lagre mi utgåve' }).click();
    await expect(form.getByRole('status')).toContainText('Tilbakemelding lagra');
    const copies = (await (await context.request.get('/api/conflicts')).json()).records;
    expect(
      copies.some(
        (c) =>
          c.collection === 'reviews' &&
          c.data.note === 'Mi nyare tilbakemelding.' &&
          c.serverVersion.note === 'Frå ei anna maskin.',
      ),
    ).toBe(true);
    await page.getByRole('button', { name: 'Verkstaden', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Kva vil du skape i dag?' })).toBeVisible();
  } finally {
    await sc.close();
  }
});

test('membership updates protect the feedback editor while the response is pending', async ({
  page,
  context,
  browser,
}) => {
  const t = await login(context, 'teacher');
  const th = { Origin: origin, 'X-CSRF-Token': t.csrf };
  await context.request.put('/api/teacher/guide', { headers: th, data: { version: 1 } });
  const group = await (
    await context.request.post('/api/groups', {
      headers: th,
      data: { name: 'Langsam medlemsendring' },
    })
  ).json();
  const contexts = await Promise.all([9, 10].map(() => browser.newContext({ baseURL: origin })));
  let release;
  const held = new Promise((r) => (release = r));
  try {
    const members = [];
    for (const [i, sc] of contexts.entries()) {
      const s = await login(sc, 'student' + (i + 9));
      members.push(s);
      const headers = { Origin: origin, 'X-CSRF-Token': s.csrf };
      await sc.request.post('/api/groups/join', { headers, data: { code: group.code } });
      const existing = await (await sc.request.get('/api/progress/skule-v1-start-01')).json();
      await sc.request.put('/api/progress/skule-v1-start-01', {
        headers,
        data: {
          revision: existing.revision,
          data: {
            files: { js: 'print(1);', html: '', css: '' },
            support: 'standard',
            reflection: '',
            selfChecked: false,
            autoPassed: false,
          },
        },
      });
    }
    await context.request.put(`/api/groups/${group.id}/members/${members[0].user.id}`, {
      headers: th,
      data: { approved: true },
    });
    await page.goto('/');
    const card = page.locator('#teacher-groups > section').filter({ hasText: group.name });
    await card.getByRole('button', { name: 'Sjå arbeid' }).click();
    await page.locator('.records summary').first().click();
    const note = page.getByLabel('Lærarvurdering');
    await expect(note).toBeEditable();
    await page.route(`**/api/groups/${group.id}/members/${members[1].user.id}`, async (route) => {
      await held;
      await route.continue();
    });
    await card.getByRole('button', { name: 'Godkjenn', exact: true }).click();
    await expect(note).not.toBeEditable();
    await expect(page.locator('#groups-status')).toContainText('Oppdaterer medlemskapet');
    release();
    await expect(page.locator('#groups-status')).toHaveText('Elevlistene er oppdaterte.');
    await expect(page.locator('#main')).not.toHaveAttribute('inert', '');
    await expect(card.getByRole('button', { name: 'Sjå arbeid' })).toHaveCount(2);
    await card.locator(`[data-read="${members[0].user.id}"]`).click();
    await page.locator('.records summary').first().click();
    let releaseRevocation;
    const revocation = new Promise((r) => (releaseRevocation = r));
    await page.route(`**/api/groups/${group.id}/members/${members[0].user.id}`, async (route) => {
      await revocation;
      await route.continue();
    });
    try {
      await card.locator(`[data-user="${members[0].user.id}"]`).click();
      await expect(page.getByLabel('Lærarvurdering')).not.toBeEditable();
      releaseRevocation();
      await expect(page.locator('#student-work')).toBeEmpty();
      expect(
        (
          await context.request.get(`/api/groups/${group.id}/students/${members[0].user.id}`)
        ).status(),
      ).toBe(403);
    } finally {
      releaseRevocation();
    }
  } finally {
    release();
    await Promise.all(contexts.map((c) => c.close()));
  }
});
