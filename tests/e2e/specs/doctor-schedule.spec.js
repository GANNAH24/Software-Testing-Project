import { test, expect } from "@playwright/test";
import { loginAsDoctor } from "../helpers/auth";

test.describe("E2E-009: Doctor Schedule", () => {
    test("doctor can view schedule page", async ({ page }) => {

        // 1️⃣ Login as doctor
        await loginAsDoctor(page);

        // 2️⃣ Ensure dashboard loaded
        await expect(page).toHaveURL(/doctor/i);

        // 3️⃣ Go to Manage Schedule
        await page.goto("http://localhost:5173/doctor/manage-schedule");

        // 4️⃣ Ensure correct page loaded
        await expect(page).toHaveURL(/manage-schedule/);

        // 5️⃣ Calendar / schedule UI exists
        const calendar = page.locator("table");
        const datePickerButtons = page.locator("button");

        await expect(
            calendar.or(datePickerButtons.first())
        ).toBeVisible({ timeout: 10000 });
    });
});
