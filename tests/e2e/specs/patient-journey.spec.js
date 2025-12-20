//patient-journey.specs
//gowa specs
// npx playwright test tests/e2e/specs/patient-journey.spec.js --headed 

import { test, expect } from "@playwright/test";
import { loginAsPatient } from "../helpers/auth";

// Run tests in this file serially to avoid race conditions when booking the same slot
test.describe.configure({ mode: 'serial' });

test.describe("E2E-001: Patient Journey", () => {
    test("patient can book an appointment successfully", async ({ page }) => {

        // 1️⃣ Login
        await loginAsPatient(page);

        // 2️⃣ Go to Find Doctors
        await page.goto("http://localhost:5173/patient/find-doctors");

        // 3️⃣ Wait for doctors to load
        const bookNowButtons = page.getByRole("button", { name: /book now/i });
        await expect(bookNowButtons.first()).toBeVisible({ timeout: 15000 });

        // 4️⃣ Click Book Now (opens QuickBookDialog)
        await bookNowButtons.first().click();

        // 5️⃣ Wait for booking dialog title
        await expect(
            page.getByText(/book appointment with/i)
        ).toBeVisible({ timeout: 10000 });

        // 6️⃣ Wait for calendar to appear
        const calendar = page.locator("table");
        await expect(calendar).toBeVisible({ timeout: 10000 });

        /**
         * 7️⃣ Select a date that HAS available slots
         * We click the first calendar button that:
         * - is not disabled
         * - has green slot styling
         */
        const availableDate = calendar.locator(
            "button:not([disabled]).bg-green-100"
        ).first();

        await expect(availableDate).toBeVisible({ timeout: 15000 });
        await availableDate.click();

        /**
         * 8️⃣ Wait for time slots to load
         * Slots are buttons containing text like "09:00-10:00"
         */
        const timeSlots = page.locator("button").filter({ hasText: "-" });

        await expect(timeSlots.first()).toBeVisible({ timeout: 15000 });
        await timeSlots.first().click();

        // 9️⃣ Confirm booking
        const confirmButton = page.getByRole("button", {
            name: /confirm booking/i,
        });

        await expect(confirmButton).toBeEnabled({ timeout: 10000 });
        await confirmButton.click();

        // 🔟 Assert success (toast message)
        await expect(
            page.getByText(/appointment booked|success/i)
        ).toBeVisible({ timeout: 15000 });
    });
});
