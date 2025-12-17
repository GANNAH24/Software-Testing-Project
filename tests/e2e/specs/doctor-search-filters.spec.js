/**
 * E2E Test: Doctor Search Filters
 *
 * Scenario: E2E-004
 */

const { test, expect } = require('@playwright/test');

test.describe('Doctor Search Filters (E2E-004)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'patient@test.com');
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);

    await page.click('text=/.*find.*doctor.*/i');
  });

  test('should filter doctors by location', async ({ page }) => {
    const locationFilter = page.locator('select[name*="location"]');
    if (await locationFilter.isVisible()) {
      await locationFilter.selectOption('New York');
      await page.waitForTimeout(1000);

      const doctors = page.locator('[class*="doctor"]');
      await expect(doctors.first()).toContainText(/new york/i);
    }
  });

  test('should combine specialty and location filters', async ({ page }) => {
    await page.locator('select[name*="specialty"]').selectOption('Cardiology');
    await page.locator('select[name*="location"]').selectOption('New York');

    await page.waitForTimeout(1000);

    const doctor = page.locator('[class*="doctor"]').first();
    await expect(doctor).toContainText(/cardio/i);
    await expect(doctor).toContainText(/new york/i);
  });
});
