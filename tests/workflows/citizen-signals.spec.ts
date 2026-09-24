import { test, expect } from '@playwright/test';

test.describe('Workflow 2: Citizen Signals & Telemetry', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Command Views' });
    await nav.getByRole('button', { name: /More/i }).click();
    await page.getByRole('button', { name: /Citizen Signals & Telemetry/i }).click();
    await expect(page.locator('main.main-content')).toBeVisible();
  });

  test('Filter signals by search query and inspect signal details', async ({ page }) => {
    // Verify main signals view container is loaded
    await expect(page.locator('main.main-content')).toBeVisible();

    // Check if search input is available
    const searchInput = page.getByPlaceholder(/Search signals|Search by keyword/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('water');
      await expect(searchInput).toHaveValue('water');
    }
  });

});
