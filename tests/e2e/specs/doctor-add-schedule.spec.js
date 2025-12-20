import { test, expect } from "@playwright/test";
import { loginAsDoctor } from "../helpers/auth";

test.describe("E2E-010: Doctor Add Schedule Slots", () => {
  test("doctor can create schedule slots successfully", async ({ page }) => {

    // 1️⃣ Login
    await loginAsDoctor(page);
    await expect(page).toHaveURL(/doctor/i);

    // 2️⃣ Go to Manage Schedule
    await page.goto("http://localhost:5173/doctor/schedule");
    await page.waitForLoadState("networkidle");

    // 3️⃣ Click Create Schedule
    const createScheduleBtn = page.getByRole("button", {
      name: /create schedule/i,
    });

    await expect(createScheduleBtn).toBeVisible({ timeout: 15000 });
    await createScheduleBtn.click();

    // 4️⃣ Modal must be open
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 10000 });

    // 5️⃣ Navigate calendar to current/future month if needed
    // Keep clicking "Go to next month" until we find an enabled date
    const nextMonthBtn = dialog.getByRole("button", { name: /go to next month/i });
    
    // Navigate forward up to 3 months to find an enabled date (gridcells without disabled attr)
    for (let i = 0; i < 3; i++) {
      const count = await dialog.locator('[role="gridcell"]:not([disabled])').count();
      if (count > 0) break;
      await nextMonthBtn.click();
      await page.waitForTimeout(300);
    }

    // 6️⃣ Select FIRST enabled calendar date (gridcell is directly clickable)
    const enabledDate = dialog.locator('[role="gridcell"]:not([disabled])').first();
    await expect(enabledDate).toBeVisible({ timeout: 10000 });
    await enabledDate.click();

    // 7️⃣ Continue to Time Slots
    const continueBtn = dialog.getByRole("button", {
      name: /continue to time slots/i,
    });

    await expect(continueBtn).toBeEnabled({ timeout: 10000 });
    await continueBtn.click();

    // 8️⃣ Select time slots (pick first one – stable)
    const timeSlotBtn = dialog.locator("button").filter({
      hasText: ":",
    }).first();

    await expect(timeSlotBtn).toBeVisible({ timeout: 10000 });
    await timeSlotBtn.click();

    // 9️⃣ Confirm & Create
    const confirmBtn = dialog.getByRole("button", {
      name: /confirm.*create/i,
    });

    await expect(confirmBtn).toBeEnabled({ timeout: 10000 });
    await confirmBtn.click();

    // 🔟 Success toast OR schedule created confirmation
    // Look for success toast message or "total schedule(s)" count on the page
    await expect(
      page.getByText(/schedule.*created|created.*success|total schedule/i).first()
    ).toBeVisible({ timeout: 15000 });
  });
});
