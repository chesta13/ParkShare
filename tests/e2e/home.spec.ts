import { expect, test } from "@playwright/test";

test("home page exposes the parking search", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Park closer/ })).toBeVisible();
  await expect(page.getByLabel("Destination")).toBeVisible();
  await expect(page.getByRole("button", { name: "Find parking" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Parking spaces" })).toBeVisible();
});


test("sign-in and registration screens are reachable", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Sign in to ParkShare." })).toBeVisible();
  await page.getByRole("link", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Create your ParkShare account." })).toBeVisible();
});

test("search validates an incomplete time range before making a request", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Start time").fill("2027-01-01T10:00");
  await page.getByRole("button", { name: "Find parking" }).click();
  await expect(page.getByRole("alert")).toContainText("Choose both a start and end time");
});
