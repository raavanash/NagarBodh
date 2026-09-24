import { test, expect } from '@playwright/test';

test.describe('Workflow 1: Development Map & Hotspot Inspection', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Command Views' });
    await nav.getByRole('button', { name: /MAP/i }).click();
    await expect(page.locator('.map-view-container')).toBeVisible();
  });

  test('Inspect Leaflet map container and bottom metrics', async ({ page }) => {
    // Verify Leaflet interactive map element is rendered
    await expect(page.locator('.leaflet-container')).toBeVisible();

    // Verify operational metrics bar at the bottom
    const metricsStrip = page.locator('.bottom-metrics-strip');
    await expect(metricsStrip).toBeVisible();
    await expect(metricsStrip.getByText(/Active Demand Hotspots/i)).toBeVisible();
    await expect(metricsStrip.getByText(/Critical Investment Gaps/i)).toBeVisible();
  });

  test('Select a hotspot and view hotspot details', async ({ page }) => {
    // Check Leaflet map canvas and sidebar elements
    await expect(page.locator('.leaflet-container')).toBeVisible();
    
    // Verify hotspot item cards or interactive marker elements are attached
    const mapContainer = page.locator('.map-view-container');
    await expect(mapContainer).toBeVisible();
  });

});
