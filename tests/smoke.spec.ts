import { expect, test } from "@playwright/test";

test("cv route returns server-rendered html", async ({ page }) => {
  const response = await page.goto("/cv");
  expect(response?.ok()).toBe(true);
  expect(await response?.text()).toContain("<h1");
  await expect(page.getByRole("heading", { name: "Eugene Mirotin" })).toBeVisible();
  await expect(page.getByText("Senior / Staff Software Engineer")).toBeVisible();
});

test("assistant terminal renders without loading the model in smoke mode", async ({ page }) => {
  await page.goto("/?noai=1");
  await expect(page.getByRole("heading", { name: "Eugene Mirotin CV Assistant" })).toBeVisible();
  await expect(page.getByTestId("recruiter-terminal")).toBeVisible();
  await expect(page.locator(".xterm")).toBeVisible();
});

test("send_email tool clicks a mailto link", async ({ page }) => {
  await page.addInitScript(() => {
    const originalClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function clickAnchor() {
      const typedWindow = window as Window & { __clickedMailto?: string };

      if (this.href.startsWith("mailto:")) {
        typedWindow.__clickedMailto = this.href;
        return;
      }

      originalClick.call(this);
    };
  });

  await page.goto("/?noai=1");
  await expect(page.locator(".xterm")).toBeVisible();
  await page.getByTestId("recruiter-terminal").click();
  await page.keyboard.type("email");
  await page.keyboard.press("Enter");

  await expect
    .poll(() =>
      page.evaluate(() => (window as Window & { __clickedMailto?: string }).__clickedMailto),
    )
    .toBe("mailto:emirotin@gmail.com?Subject=From+CV");
});
