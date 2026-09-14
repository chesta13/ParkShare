import { expect, test } from "@playwright/test";

test("home page exposes the parking search", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Park closer\. ParkShare smarter\./i })).toBeVisible();
  await expect(page.getByLabel("Destination")).toBeVisible();
  await expect(page.getByRole("button", { name: "Find parking" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Popular spaces" })).toBeVisible();
});
