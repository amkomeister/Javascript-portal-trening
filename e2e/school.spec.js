import { test, expect } from '@playwright/test';
test('a beginner signs in, chooses a grade, edits and checks a visual lesson', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Prøv som elev' }).click();
  await page.getByRole('button', { name: '8. trinn', exact: true }).click();
  await page.getByRole('button', { name: 'Start med den første roboten' }).click();
  await expect(page.getByRole('heading', { name: 'Gje roboten ei ny drakt' })).toBeVisible();
  const editor = page.locator('.cm-content');
  await editor.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.insertText('rect(170, 90, 140, 150, "lime");');
  await page.getByRole('button', { name: 'Køyr koden', exact: true }).click();
  await expect(page.locator('#run-status')).toHaveText('Køyrer');
  await page.getByRole('button', { name: 'Sjekk koden', exact: true }).click();
  await expect(page.locator('#auto-result')).toContainText('Sjekken består');
  await page
    .getByLabel('Mi forklaring')
    .fill('Eg endra fargen til lime. Tala bestemmer form og plassering.');
  await expect(page.locator('#save-status')).toHaveText('Lagra');
  await page.reload();
  await page.getByRole('button', { name: 'Start med den første roboten' }).click();
  await expect(page.getByLabel('Mi forklaring')).toHaveValue(/Eg endra/);
});
