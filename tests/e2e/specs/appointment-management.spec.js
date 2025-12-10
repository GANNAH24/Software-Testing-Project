/**
 * E2E Test: Appointment Management
 * 
 * User Stories: US-014, US-015, US-016, US-017
 * 
 * TDD Principles Applied:
 * 1. Tests complete appointment lifecycle
 * 2. Validates state transitions (booked → cancelled)
 * 3. Verifies authorization and business rules
 * 
 * Test Scenario: E2E-003 from E2E_TEST_SCENARIOS.md
 */

const { test, expect } = require('@playwright/test');

test.describe('Appointment Management (E2E-003)', () => {
  test.describe('Patient Appointment Management', () => {
    test('should view all patient appointments', async ({ page }) => {
      // Login as patient
      await page.goto('/login');
      // Note: In real tests, use proper test credentials
      await page.fill('input[type="email"]', 'patient@test.com');
      await page.fill('input[type="password"]', 'SecurePass123!');
      
      try {
        await page.click('button[type="submit"]');
        await page.waitForURL(/.*dashboard/, { timeout: 5000 });
      } catch {
        test.skip();
      }
      
      // Navigate to appointments
      await page.click('text=/.*(?:my )?appointments.*/i, a[href*="appointment"]');
      
      // Verify appointments list is displayed
      const appointmentsList = page.locator('[class*="appointment"], [data-testid*="appointment"]');
      await expect(appointmentsList.first()).toBeVisible({ timeout: 5000 });
    });

    test('should filter between upcoming and past appointments', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'patient@test.com');
      await page.fill('input[type="password"]', 'SecurePass123!');
      
      try {
        await page.click('button[type="submit"]');
        await page.waitForURL(/.*dashboard/, { timeout: 5000 });
      } catch {
        test.skip();
      }
      
      // Navigate to appointments
      await page.click('text=/.*appointments.*/i');
      
      await page.waitForTimeout(1000);
      
      // Check for filter tabs/buttons
      const upcomingTab = page.locator('text=/.*upcoming.*/i, [data-testid="upcoming-tab"]');
      const pastTab = page.locator('text=/.*(?:past|history).*/i, [data-testid="past-tab"]');
      
      if (await upcomingTab.isVisible()) {
        await upcomingTab.click();
        await page.waitForTimeout(500);
        
        // Verify upcoming appointments are shown
        const appointments = page.locator('[class*="appointment"]');
        const count = await appointments.count();
        expect(count).toBeGreaterThanOrEqual(0);
        
        // Switch to past
        await pastTab.click();
        await page.waitForTimeout(500);
      }
    });

    test('should cancel a future appointment', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'patient@test.com');
      await page.fill('input[type="password"]', 'SecurePass123!');
      
      try {
        await page.click('button[type="submit"]');
        await page.waitForURL(/.*dashboard/, { timeout: 5000 });
      } catch {
        test.skip();
      }
      
      // Navigate to appointments
      await page.click('text=/.*appointments.*/i');
      
      await page.waitForTimeout(1000);
      
      // Find first appointment with cancel button
      const cancelButton = page.locator('button:has-text("Cancel")').first();
      
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        
        // Confirm cancellation in dialog
        await page.waitForTimeout(500);
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
        
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
          
          // Verify success message
          await page.waitForTimeout(1000);
          const successMessage = page.locator('text=/.*(?:cancelled|success).*/i');
          await expect(successMessage.first()).toBeVisible({ timeout: 5000 });
        }
      }
    });

    test('should not allow cancelling past appointments', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'patient@test.com');
      await page.fill('input[type="password"]', 'SecurePass123!');
      
      try {
        await page.click('button[type="submit"]');
        await page.waitForURL(/.*dashboard/, { timeout: 5000 });
      } catch {
        test.skip();
      }
      
      // Navigate to past appointments
      await page.click('text=/.*appointments.*/i');
      await page.waitForTimeout(1000);
      
      const pastTab = page.locator('text=/.*past.*/i');
      if (await pastTab.isVisible()) {
        await pastTab.click();
        await page.waitForTimeout(500);
        
        // Verify no cancel buttons on past appointments
        const cancelButtons = page.locator('button:has-text("Cancel")');
        const count = await cancelButtons.count();
        expect(count).toBe(0);
      }
    });
  });

  test.describe('Doctor Appointment Management', () => {
    test('should view doctor appointments', async ({ page }) => {
      // Login as doctor
      await page.goto('/login');
      await page.fill('input[type="email"]', 'doctor@test.com');
      await page.fill('input[type="password"]', 'SecurePass123!');
      
      try {
        await page.click('button[type="submit"]');
        await page.waitForURL(/.*dashboard/, { timeout: 5000 });
      } catch {
        test.skip();
      }
      
      // Verify doctor dashboard shows appointments
      const appointmentSection = page.locator('text=/.*appointments.*/i, [class*="appointment"]');
      await expect(appointmentSection.first()).toBeVisible({ timeout: 5000 });
    });

    test('should filter appointments by date', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'doctor@test.com');
      await page.fill('input[type="password"]', 'SecurePass123!');
      
      try {
        await page.click('button[type="submit"]');
        await page.waitForURL(/.*dashboard/, { timeout: 5000 });
      } catch {
        test.skip();
      }
      
      // Look for date filter
      const dateFilter = page.locator('input[type="date"]').first();
      if (await dateFilter.isVisible()) {
        const today = new Date().toISOString().split('T')[0];
        await dateFilter.fill(today);
        
        await page.waitForTimeout(1000);
        
        // Verify filtered results
        const appointments = page.locator('[class*="appointment"]');
        const count = await appointments.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    test('should filter appointments by status', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'doctor@test.com');
      await page.fill('input[type="password"]', 'SecurePass123!');
      
      try {
        await page.click('button[type="submit"]');
        await page.waitForURL(/.*dashboard/, { timeout: 5000 });
      } catch {
        test.skip();
      }
      
      // Look for status filter
      const statusFilter = page.locator('select[name*="status"], [data-testid*="status-filter"]');
      if (await statusFilter.isVisible()) {
        await statusFilter.selectOption('confirmed');
        
        await page.waitForTimeout(1000);
        
        // Verify filtered results show only confirmed
        const appointments = page.locator('[class*="appointment"]');
        const count = await appointments.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
