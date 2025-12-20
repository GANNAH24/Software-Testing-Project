//doctor-search.specs.js
//path: Software-Testing-Project\tests\e2e\specs\doctor-search.spec.js
//npx playwright test tests/e2e/specs/doctor-search.spec.js --headed   
import { test, expect } from "@playwright/test";
import { loginAsPatient } from "../helpers/auth";

test.describe("E2E-004: Doctor Search", () => {
    test("patient can search and view doctors", async ({ page }) => {
        // 1️⃣ Login
        await loginAsPatient(page);

        // 2️⃣ Go to Find Doctors
        await page.goto("http://localhost:5173/patient/find-doctors");

        // 3️⃣ Wait for search input
        const searchInput = page.getByPlaceholder("Search by doctor or specialty");
        await expect(searchInput).toBeVisible({ timeout: 15000 });

        // 4️⃣ Doctors should load (Book Now buttons exist)
        const bookNowButtons = page.getByRole("button", { name: /book now/i });
        await expect(bookNowButtons.first()).toBeVisible({ timeout: 15000 });

        // 5️⃣ Search by specialty
        await searchInput.fill("Cardio");
        await page.waitForTimeout(1000); // allow filtering

        // 6️⃣ After search, doctors still visible OR no doctors message
        const noDoctorsText = page.getByText(/no doctors found/i);

        if ((await bookNowButtons.count()) > 0) {
            await expect(bookNowButtons.first()).toBeVisible();
        } else {
            await expect(noDoctorsText).toBeVisible();
        }

        // 7️⃣ Click View Profile of first doctor
        const viewProfileBtn = page
            .getByRole("button", {
                name: /view profile/i,
            })
            .first();

        await expect(viewProfileBtn).toBeVisible();
        await viewProfileBtn.click();

        // 8️⃣ Doctor profile page loaded
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
            timeout: 10000,
        });
    });
});


