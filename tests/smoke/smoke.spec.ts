import { test, expect } from '@playwright/test';

test.describe('NagarBodh Smoke Test Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to NagarBodh application root
    await page.goto('/');
    // Wait for the app container to load
    await expect(page.locator('.app-container')).toBeVisible();
  });

  test('1. NagarBodh application loads successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/NagarBodh|Vite/i);
    await expect(page.locator('header.navbar')).toBeVisible();
  });

  test('2. NagarBodh branding and subtitle are visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'NagarBodh' })).toBeVisible();
    await expect(page.locator('.brand-tag-badge')).toBeAttached();
  });

  test('3. Main navigation bar is visible and renders primary stages', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Command Views' });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('button', { name: /INVEST/i })).toBeVisible();
    await expect(nav.getByRole('button', { name: /MAP/i })).toBeVisible();
    await expect(nav.getByRole('button', { name: /DECIDE/i })).toBeVisible();
    await expect(nav.getByRole('button', { name: /IMPACT/i })).toBeVisible();
    await expect(nav.getByRole('button', { name: /More/i })).toBeVisible();
  });

  test('4. Development Map view opens and displays city metrics', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Command Views' });
    await nav.getByRole('button', { name: /MAP/i }).click();

    // Verify Map View container and bottom metrics strip are displayed
    await expect(page.locator('.map-view-container')).toBeVisible();
    await expect(page.locator('.leaflet-container')).toBeVisible();
    await expect(page.getByText(/Active Demand Hotspots/i)).toBeVisible();
  });

  test('5. Demand Intelligence / Dossier view opens', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Command Views' });
    await nav.getByRole('button', { name: /More/i }).click();
    await page.getByRole('button', { name: /Historical Incident Dossiers/i }).click();

    // Verify dossier content container is present
    await expect(page.locator('main.main-content')).toBeVisible();
  });

  test('6. Citizen Signals view opens', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Command Views' });
    await nav.getByRole('button', { name: /More/i }).click();
    await page.getByRole('button', { name: /Citizen Signals & Telemetry/i }).click();

    // Verify Citizen Signals view is loaded
    await expect(page.locator('main.main-content')).toBeVisible();
  });

  test('7. Investment Gaps view opens', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Command Views' });
    await nav.getByRole('button', { name: /INVEST/i }).click();

    // Verify Investment Board content is visible
    await expect(page.locator('main.main-content')).toBeVisible();
  });

  test('8. Command Center / Decision Pipeline opens', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Command Views' });
    await nav.getByRole('button', { name: /DECIDE/i }).click();

    // Verify Decision Pipeline / Response Planner view is visible
    await expect(page.locator('.planner-container').first()).toBeVisible();
  });

  test('9. Impact / Verification view opens', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Command Views' });
    await nav.getByRole('button', { name: /IMPACT/i }).click();

    // Verify Impact Verification timeline is visible
    await expect(page.locator('.timeline-view-container').first()).toBeVisible();
  });

  test('10. No critical navigation or runtime failures occur across tab switches', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Command Views' });

    // Rapidly switch through main tabs to test stability
    await nav.getByRole('button', { name: /MAP/i }).click();
    await expect(page.locator('.map-view-container')).toBeVisible();

    await nav.getByRole('button', { name: /DECIDE/i }).click();
    await expect(page.locator('main.main-content')).toBeVisible();

    await nav.getByRole('button', { name: /IMPACT/i }).click();
    await expect(page.locator('main.main-content')).toBeVisible();

    await nav.getByRole('button', { name: /INVEST/i }).click();
    await expect(page.locator('main.main-content')).toBeVisible();
  });

});
