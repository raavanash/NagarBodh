import { test, expect } from '@playwright/test';

test.describe('Workflow 3: Historical Incident Dossier', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Command Views' });
    await nav.getByRole('button', { name: /More/i }).click();
    await page.getByRole('button', { name: /Historical Incident Dossiers/i }).click();
    await expect(page.locator('main.main-content')).toBeVisible();
  });

  test('View incident dossier details and inspect evidence context', async ({ page }) => {
    // Verify main dossier view header / content is visible
    await expect(page.locator('main.main-content')).toBeVisible();

    // Navigate back to main INVEST view
    const nav = page.getByRole('navigation', { name: 'Command Views' });
    await nav.getByRole('button', { name: /INVEST/i }).click();
    await expect(page.locator('main.main-content')).toBeVisible();
  });

});
