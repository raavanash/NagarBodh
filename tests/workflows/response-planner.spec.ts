import { test, expect } from '@playwright/test';

test.describe('Workflow 4: Response & Decision Pipeline (DECIDE)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Command Views' });
    await nav.getByRole('button', { name: /DECIDE/i }).click();
    await expect(page.locator('main.main-content')).toBeVisible();
  });

  test('Inspect candidate development projects and department allocation UI', async ({ page }) => {
    // Verify Decision Pipeline container is loaded
    await expect(page.locator('.planner-container').first()).toBeVisible();
  });

});
