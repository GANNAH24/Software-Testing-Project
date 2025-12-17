/**
 * E2E Test: Doctor Schedule Management
 *
 * User Stories:
 * - US-018: Create availability schedule
 * - US-019: Set recurring weekly schedules
 * - US-020: Prevent conflicting schedules
 *
 * Scenario: E2E-009
 */

const { test, expect } = require('@playwright/test');

test.describe('Doctor Schedule Management (E2E-009)', () => {

  test.beforeEach(async ({ page }) => {
    // Login as doctor
    await page.goto('/login');
    await page.fill('input[type="email"]', 'doctor@test.com');
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/, { timeout: 5000 });
  });

  test('should create a recurring weekly schedule', async ({ page }) => {
    // Navigate to schedule management
    await page.click('text=/.*manage.*schedule.*/i');
    await page.waitForTimeout(1000);

    await page.click('button:has-text("Add"), button:has-text("New Schedule")');

    // Select future date
    const future = new Date();
    future.setDate(future.getDate() + 7);
    const dateStr = future.toISOString().split('T')[0];

    await page.fill('input[type="date"]', dateStr);

    // Select time slot
    await page.click('button:has-text("10:00"), button:has-text("10")');

    // Enable recurring
    const repeatCheckbox = page.locator('input[type="checkbox"]');
    if (await repeatCheckbox.isVisible()) {
      await repeatCheckbox.check();
    }

    await page.click('button:has-text("Create")');

    // Verify success
    const success = page.locator('text=/.*schedule.*created.*/i');
    await expect(success).toBeVisible({ timeout: 5000 });
  });

  test('should prevent conflicting schedules', async ({ page }) => {
    await page.click('text=/.*manage.*schedule.*/i');
    await page.waitForTimeout(1000);

    await page.click('button:has-text("Add")');

    const dateInput = page.locator('input[type="date"]');
    await dateInput.fill(await dateInput.inputValue());

    // Try same time slot again
    await page.click('button:has-text("10:00")');
    await page.click('button:has-text("Create")');

    const error = page.locator('text=/.*conflict|overlap.*/i');
    await expect(error).toBeVisible({ timeout: 5000 });
  });
});
