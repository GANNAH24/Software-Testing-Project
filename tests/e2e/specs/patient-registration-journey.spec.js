/**
 * E2E Test: Patient Registration and Login Journey
 * 
 * User Story: US-001 (Patient Registration), US-003 (User Login)
 * 
 * TDD Principles Applied:
 * 1. Tests business requirements directly from user stories
 * 2. Tests full user workflow end-to-end
 * 3. Validates UI interactions and business logic integration
 * 
 * Test Scenario: E2E-001 from E2E_TEST_SCENARIOS.md
 */

const { test, expect } = require('@playwright/test');

test.describe('Patient Registration and Login Journey (E2E-001)', () => {
  const testPatient = {
    email: `patient.e2e.${Date.now()}@test.com`,
    password: 'SecurePass123!',
    fullName: 'John Doe Test',
    phone: '1234567890',
    dateOfBirth: '1990-01-15',
    gender: 'Male'
  };

  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
  });

  test('should complete full patient registration journey', async ({ page }) => {
    // Step 1: Navigate to registration page
    await page.click('text=Register');
    await expect(page).toHaveURL(/.*register/);
    
    // Step 2: Verify registration form is displayed
    await expect(page.locator('h1, h2').filter({ hasText: /register/i })).toBeVisible();
    
    // Step 3: Select patient role
    await page.click('[value="patient"], text=Patient');
    
    // Step 4: Fill registration form
    await page.fill('input[name="email"], input[type="email"]', testPatient.email);
    await page.fill('input[name="password"], input[type="password"]', testPatient.password);
    await page.fill('input[name="fullName"]', testPatient.fullName);
    await page.fill('input[name="phoneNumber"], input[name="phone"]', testPatient.phone);
    await page.fill('input[name="dateOfBirth"], input[type="date"]', testPatient.dateOfBirth);
    
    // Select gender
    const genderSelect = page.locator('select[name="gender"]');
    if (await genderSelect.isVisible()) {
      await genderSelect.selectOption(testPatient.gender);
    } else {
      await page.click(`text=${testPatient.gender}`);
    }
    
    // Step 5: Submit registration
    await page.click('button[type="submit"], button:has-text("Register")');
    
    // Step 6: Verify successful registration
    // Either redirected to dashboard or see success message
    await page.waitForURL(/.*(?:dashboard|login)/, { timeout: 10000 });
    
    // If redirected to login, proceed with login
    const currentUrl = page.url();
    if (currentUrl.includes('login')) {
      await page.fill('input[type="email"]', testPatient.email);
      await page.fill('input[type="password"]', testPatient.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*dashboard/);
    }
    
    // Step 7: Verify patient is logged in and on dashboard
    await expect(page).toHaveURL(/.*patient.*dashboard/);
    await expect(page.locator(`text=${testPatient.fullName}`)).toBeVisible({ timeout: 5000 });
  });

  test('should show validation errors for incomplete registration', async ({ page }) => {
    // Navigate to registration
    await page.click('text=Register');
    
    // Select patient role
    await page.click('[value="patient"], text=Patient');
    
    // Try to submit without filling required fields
    await page.click('button[type="submit"]');
    
    // Verify validation errors are shown
    const errorMessages = page.locator('[class*="error"], [class*="invalid"], .text-red-500');
    await expect(errorMessages.first()).toBeVisible({ timeout: 3000 });
  });

  test('should show error for weak password', async ({ page }) => {
    await page.click('text=Register');
    await page.click('[value="patient"], text=Patient');
    
    // Fill form with weak password
    await page.fill('input[type="email"]', testPatient.email);
    await page.fill('input[type="password"]', 'weak');
    
    // Check if password strength indicator shows error
    const passwordError = page.locator('text=/.*(?:weak|strong|requirement).*/', { hasText: true });
    await expect(passwordError).toBeVisible({ timeout: 3000 });
  });

  test('should successfully login after registration', async ({ page }) => {
    // Assume user is already registered (from previous test or setup)
    await page.click('text=Login');
    
    // Fill login form
    await page.fill('input[type="email"]', testPatient.email);
    await page.fill('input[type="password"]', testPatient.password);
    
    // Submit login
    await page.click('button[type="submit"]:has-text("Login"), button[type="submit"]:has-text("Sign In")');
    
    // Verify redirect to patient dashboard
    await page.waitForURL(/.*patient.*dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/.*patient.*dashboard/);
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    await page.click('text=Login');
    
    // Fill with invalid credentials
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'WrongPassword123!');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Verify error message is shown
    const errorMessage = page.locator('text=/.*(?:invalid|incorrect|error).*/i');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
  });
});
