/**
 * E2E Test: Registration Validation Errors
 *
 * Scenario: E2E-003
 */

const { test, expect } = require('@playwright/test');

test.describe('Registration Validation Errors (E2E-003)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await page.click('text=Patient');
  });

  test('should show detailed password validation errors', async ({ page }) => {
    await page.fill('input[type="password"]', 'weak');

    const rules = [
      /8 characters/i,
      /uppercase/i,
      /lowercase/i,
      /number/i,
      /special/i
    ];

    for (const rule of rules) {
      await expect(page.locator(`text=${rule}`)).toBeVisible();
    }
  });

  test('should show invalid email error', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid-email');
    await page.click('button[type="submit"]');

    const error = page.locator('text=/.*invalid email.*/i');
    await expect(error).toBeVisible();
  });

  test('should require full name', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');

    const error = page.locator('text=/.*full name.*required.*/i');
    await expect(error).toBeVisible();
  });
});
