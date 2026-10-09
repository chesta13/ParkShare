import { expect, test } from "@playwright/test";

function localDateTime(date: Date): string {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

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

test("owner can publish a listing and a driver can create and cancel a booking hold", async ({ page }) => {
  const unique = Date.now();
  const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
  start.setMinutes(0, 0, 0);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

  await page.goto("/register");
  await page.getByLabel("Name").fill("CI Owner");
  await page.getByLabel("Email").fill(`owner-${unique}@example.com`);
  await page.getByLabel(/Password/).fill("ParkShare-CI-Owner-123!");
  await page.getByLabel("I want to").selectOption("OWNER");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByRole("link", { name: /List my space/ }).click();

  await page.getByLabel("Area / locality").fill("CI Test Locality");
  await page.getByLabel("City").fill("Test City");
  await page.getByLabel("Address or access description").fill("Use the marked driveway entrance.");
  await page.getByLabel("Listing title").fill(`CI Test Parking ${unique}`);
  await page.getByLabel("Vehicle type").selectOption("car");
  await page.getByLabel("Description").fill("Automated test listing.");
  await page.getByLabel("Available from").fill(localDateTime(start));
  await page.getByLabel("Available until").fill(localDateTime(end));
  await page.getByLabel(/Hourly price/).fill("60");
  await page.getByRole("button", { name: "Save listing draft" }).click();
  await expect(page.getByRole("heading", { name: "Listing draft saved." })).toBeVisible();
  await page.getByRole("link", { name: "Back to dashboard" }).click();
  await page.getByRole("button", { name: "Publish listing" }).click();
  await expect(page.getByText("Status: ACTIVE")).toBeVisible();

  await page.goto("/register");
  await page.getByLabel("Name").fill("CI Driver");
  await page.getByLabel("Email").fill(`driver-${unique}@example.com`);
  await page.getByLabel(/Password/).fill("ParkShare-CI-Driver-123!");
  await page.getByLabel("I want to").selectOption("DRIVER");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByLabel("Destination").fill("CI Test Locality");
  await page.getByLabel("Start time").fill(localDateTime(start));
  await page.getByLabel("End time").fill(localDateTime(end));
  await page.getByRole("button", { name: "Find parking" }).click();
  await expect(page.getByRole("heading", { name: new RegExp(`CI Test Parking ${unique}`) })).toBeVisible();
  await page.getByRole("button", { name: "Hold this space for 10 minutes" }).click();
  await expect(page.getByRole("status")).toContainText("Payment is not integrated yet; no charge has been taken.");

  await page.getByRole("link", { name: "My bookings" }).click();
  await expect(page.getByRole("heading", { name: "My bookings" })).toBeVisible();
  await expect(page.getByText(new RegExp(`CI Test Parking ${unique}`))).toBeVisible();
  await page.getByRole("button", { name: "Cancel hold" }).click();
  await expect(page.getByText(/Status: CANCELLED/)).toBeVisible();
});
