import { test, expect } from "@playwright/test";
import { loginAsPatient } from "../helpers/auth";

test.describe("E2E-005: Booking Happy Path", () => {
    test("patient can open booking flow", async ({ page }) => {

        // 1️⃣ Login
        await loginAsPatient(page);

        // 2️⃣ Go to Find Doctors
        await page.goto("http://localhost:5173/patient/find-doctors");

        // 3️⃣ Click Book Now
        const bookNowButtons = page.getByRole("button", { name: /book now/i });
        await expect(bookNowButtons.first()).toBeVisible({ timeout: 15000 });
        await bookNowButtons.first().click();

        // 4️⃣ Booking dialog opens
        await expect(
            page.getByText(/book appointment with/i)
        ).toBeVisible({ timeout: 10000 });

        // 5️⃣ Calendar is visible
        const calendar = page.locator("table");
        await expect(calendar).toBeVisible({ timeout: 10000 });

        // 6️⃣ At least one selectable date exists
        const selectableDates = calendar.locator("button:not([disabled])");
        await expect(selectableDates.first()).toBeVisible({ timeout: 10000 });
    });
});


