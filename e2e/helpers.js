import { expect } from '@playwright/test';
export const origin = 'http://127.0.0.1:5176';
export async function login(context, account = 'student2') {
  const res = await context.request.post('/api/auth/local', {
    headers: { Origin: origin },
    data: { account },
  });
  expect(res.ok()).toBe(true);
  const me = await res.json();
  if (!me.user.grade && me.user.role === 'student')
    await context.request.put('/api/profile', {
      headers: { Origin: origin, 'X-CSRF-Token': me.csrf },
      data: { grade: 9 },
    });
  return me;
}
export async function openLesson(page, id) {
  await page.goto('/');
  await page.locator('[data-module="' + id.split('-')[2] + '"]').click();
  await page.locator('[data-lesson="' + id + '"]').click();
  await expect(page.locator('.cm-content')).toBeVisible();
}
export async function edit(page, code) {
  await page.locator('.cm-content').click();
  await page.keyboard.press('Control+a');
  await page.keyboard.insertText(code);
}
export async function saved(page) {
  await expect(page.locator('#save-status')).toHaveText('Lagra');
}
