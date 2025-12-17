/**
 * E2E Test: Cross-Role Healthcare Workflow
 *
 * Scenario: E2E-010
 * Doctor creates schedule → Patient books → Doctor sees booking
 */

const { test, expect } = require('@playwright/test');

test.describe('Cross-Role Integration (E2E-010)', () => {

  test('doctor creates schedule, patient books, doctor views appointment', async ({ browser }) => {
    // ---------- Doctor creates schedule ----------
    const doctorContext = await browser.newContext();
    const doctorPage = await doctorContext.newPage();

    await doctorPage.goto('/login');
    await doctorPage.fill('input[type="email"]', 'doctor@test.com');
    await doctorPage.fill('input[type="password"]', 'SecurePass123!');
    await doctorPage.click('button[type="submit"]');
    await doctorPage.waitForURL(/.*dashboard/);

    await doctorPage.click('text=/.*schedule.*/i');
    await doctorPage.click('button:has-text("Add")');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    await doctorPage.fill('input[type="date"]', dateStr);
    await doctorPage.click('button:has-text("10:00")');
    await doctorPage.click('button:has-text("Create")');

    await doctorContext.close();

    // ---------- Patient books appointment ----------
    const patientContext = await browser.newContext();
    const patientPage = await patientContext.newPage();

    await patientPage.goto('/login');
    await patientPage.fill('input[type="email"]', 'patient@test.com');
    await patientPage.fill('input[type="password"]', 'SecurePass123!');
    await patientPage.click('button[type="submit"]');
    await patientPage.waitForURL(/.*dashboard/);

    await patientPage.click('text=/.*book.*appointment.*/i');
    await patientPage.click('[class*="doctor"] >> text=/.*john.*/i');

    await patientPage.fill('input[type="date"]', dateStr);
    await patientPage.click('button:has-text("10:00")');
    await patientPage.click('button:has-text("Confirm")');

    const success = patientPage.locator('text=/.*booked.*success.*/i');
    await expect(success).toBeVisible({ timeout: 5000 });

    await patientContext.close();

    // ---------- Doctor verifies appointment ----------
    const doctorContext2 = await browser.newContext();
    const doctorPage2 = await doctorContext2.newPage();

    await doctorPage2.goto('/login');
    await doctorPage2.fill('input[type="email"]', 'doctor@test.com');
    await doctorPage2.fill('input[type="password"]', 'SecurePass123!');
    await doctorPage2.click('button[type="submit"]');
    await doctorPage2.waitForURL(/.*dashboard/);

    await doctorPage2.click('text=/.*appointments.*/i');

    const appointment = doctorPage2.locator('text=/.*patient.*10:00.*/i');
    await expect(appointment).toBeVisible({ timeout: 5000 });

    await doctorContext2.close();
  });
});
