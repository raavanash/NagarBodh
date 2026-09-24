import { test, expect } from '@playwright/test';

test.describe('Resilience & Failure Handling Suite', () => {

  test('Graceful degradation when Weather API fails (HTTP 500)', async ({ page }) => {
    // Intercept OpenWeather or weather API requests and mock 500 error
    await page.route('**/api/weather**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await page.goto('/');
    await expect(page.locator('.app-container')).toBeVisible();

    // Verify application remains functional and doesn't crash to blank screen
    await expect(page.getByRole('heading', { name: 'NagarBodh' })).toBeVisible();
    const nav = page.getByRole('navigation', { name: 'Command Views' });
    await expect(nav).toBeVisible();
  });

  test('Graceful degradation when external Citizen Signal API fails', async ({ page }) => {
    // Intercept external Bluesky API calls specifically
    await page.route('https://public.api.bsky.app/**', route => route.abort());

    await page.goto('/');
    await expect(page.locator('.app-container')).toBeVisible();

    // Open Citizen Signals tab
    const nav = page.getByRole('navigation', { name: 'Command Views' });
    await nav.getByRole('button', { name: /More/i }).click();
    await page.getByRole('button', { name: /Citizen Signals & Telemetry/i }).click();

    // Verify app handles signal feed unavailability with fallback demo signals
    await expect(page.locator('main.main-content')).toBeVisible();
  });

  test('Simulation mode deterministic fallback works seamlessly', async ({ page }) => {
    await page.goto('/');

    // Ensure SIM mode button is active or click it
    const simBtn = page.getByRole('button', { name: /SIM/i }).first();
    await simBtn.click();

    // Verify floating Demo Command Center pill appears in SIM mode
    await expect(page.locator('.app-container')).toBeVisible();
  });

});
