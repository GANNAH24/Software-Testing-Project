import { expect } from "@playwright/test";

export async function loginAsPatient(page) {
    await page.goto("http://localhost:5173/login");

    await page.fill("#email", "Elena@example.com");
    await page.fill("#password", "Rahma@123");

    await page.locator('button[type="submit"]').click();

    //   await page.getByRole("button", { name: /login/i }).click();

    await expect(page).toHaveURL(/\/patient\/dashboard/);
}

export async function loginAsDoctor(page) {
    await page.goto("http://localhost:5173/login"); // <-- use full URL

    await page.fill("#email", "dr.roro@gmail.com");
    await page.fill("#password", "Rahma@123");

    //   await page.getByRole("button", { name: /login/i }).click();

    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/doctor\/dashboard/);
}