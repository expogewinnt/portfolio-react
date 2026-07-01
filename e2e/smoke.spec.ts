import { expect, test } from "@playwright/test";

test("public and demo gallery pages render", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".portfolioHeader")).toBeVisible();

  await page.goto("/demo");
  await expect(page.locator(".portfolioHeader")).toBeVisible({ timeout: 15_000 });
});
