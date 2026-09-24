import { test, expect } from '@playwright/test';

test.describe('Visual Regression Baseline Suite', () => {

  test.use({
    viewport: { width: 1440, height: 900 },
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Set SIM mode for deterministic state rendering
    const simBtn = page.getByRole('button', { name: /^SIM$/i }).first();
    if (await simBtn.isVisible()) {
      await simBtn.click();
    }
    await page.waitForLoadState('networkidle');
  });

  test('1. Baseline Screenshot — Civic Investment Board (INVEST)', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Command Views' });
    await nav.getByRole('button', { name: /INVEST/i }).click();
    await page.waitForTimeout(500); // Allow smooth render
    await expect(page).toHaveScreenshot('investment-board-baseline.png', {
      maxDiffPixelRatio: 0.1,
    });
  });

  test('2. Baseline Screenshot — Spatial Evidence Lens (MAP)', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Command Views' });
    await nav.getByRole('button', { name: /MAP/i }).click();
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('development-map-baseline.png', {
      maxDiffPixelRatio: 0.1,
      mask: [page.locator('.bottom-metrics-strip')], // Mask dynamic counter if any
    });
  });

  test('3. Baseline Screenshot — Decision & Approvals Pipeline (DECIDE)', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Command Views' });
    await nav.getByRole('button', { name: /DECIDE/i }).click();
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('decision-pipeline-baseline.png', {
      maxDiffPixelRatio: 0.1,
    });
  });

  test('4. Baseline Screenshot — Citizen Signals & Telemetry', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Command Views' });
    await nav.getByRole('button', { name: /More/i }).click();
    await page.getByRole('button', { name: /Citizen Signals & Telemetry/i }).click();
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('citizen-signals-baseline.png', {
      maxDiffPixelRatio: 0.1,
    });
  });

  test('5. Baseline Screenshot — Historical Incident Dossier', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Command Views' });
    await nav.getByRole('button', { name: /More/i }).click();
    await page.getByRole('button', { name: /Historical Incident Dossiers/i }).click();
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('incident-dossier-baseline.png', {
      maxDiffPixelRatio: 0.1,
    });
  });

});
