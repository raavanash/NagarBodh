import { test, expect } from '@playwright/test';

test.describe('NagarBodh Navigation & Controls Suite', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.app-container')).toBeVisible();
  });

  test('Primary desktop navigation tab switching', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Command Views' });

    // Click MAP tab
    await nav.getByRole('button', { name: /MAP/i }).click();
    await expect(nav.getByRole('button', { name: /MAP/i })).toHaveClass(/active/);

    // Click DECIDE tab
    await nav.getByRole('button', { name: /DECIDE/i }).click();
    await expect(nav.getByRole('button', { name: /DECIDE/i })).toHaveClass(/active/);

    // Click IMPACT tab
    await nav.getByRole('button', { name: /IMPACT/i }).click();
    await expect(nav.getByRole('button', { name: /IMPACT/i })).toHaveClass(/active/);

    // Click INVEST tab
    await nav.getByRole('button', { name: /INVEST/i }).click();
    await expect(nav.getByRole('button', { name: /INVEST/i })).toHaveClass(/active/);
  });

  test('Secondary capabilities dropdown menu under MORE', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Command Views' });
    const moreBtn = nav.getByRole('button', { name: /More/i });

    // Open More menu
    await moreBtn.click();
    await expect(page.getByText('Advanced Capabilities').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Citizen Signals & Telemetry/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /National Policy Leaderboard/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Historical Incident Dossiers/i })).toBeVisible();

    // Click Citizen Signals
    await page.getByRole('button', { name: /Citizen Signals & Telemetry/i }).click();
    await expect(page.locator('main.main-content')).toBeVisible();
  });

  test('Ingestion mode switcher toggles between SIM and LIVE', async ({ page }) => {
    const liveBtn = page.getByRole('button', { name: /LIVE/i }).first();
    const simBtn = page.getByRole('button', { name: /SIM/i }).first();

    await expect(simBtn).toBeVisible();
    await expect(liveBtn).toBeVisible();

    // Toggle to LIVE mode
    await liveBtn.click();
    await expect(liveBtn).toHaveClass(/bg-emerald/);

    // Toggle back to SIM mode
    await simBtn.click();
    await expect(simBtn).toHaveClass(/bg-blue/);
  });

  test('Theme switcher toggles light and dark modes', async ({ page }) => {
    const themeBtn = page.getByTitle(/Switch to Light Theme|Switch to Dark Theme/i);
    await expect(themeBtn).toBeVisible();

    // Click theme toggle
    await themeBtn.click();
    // Click again to restore
    await themeBtn.click();
  });

});
