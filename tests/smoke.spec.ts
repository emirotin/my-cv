import { expect, test } from "@playwright/test";

const contactText = "Email: emirotin@gmail.com\nSubject: From CV";
const runsAgainstPreview = process.env.PLAYWRIGHT_SERVER === "preview";

test("cv route returns server-rendered html", async ({ page }) => {
  const response = await page.goto("/cv");
  expect(response?.ok()).toBe(true);
  expect(await response?.text()).toContain("<h1");
  await expect(page.getByRole("heading", { name: "Eugene Mirotin" })).toBeVisible();
  await expect(page.getByText("Staff Software Engineer")).toBeVisible();
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
});

test("assistant terminal renders without loading the model in smoke mode", async ({ page }) => {
  await page.goto("/?noai=1");
  await expect(page.getByRole("heading", { name: "Eugene Mirotin CV Assistant" })).toBeVisible();
  await expect(page.getByTestId("recruiter-terminal")).toBeVisible();
  await expect(page.locator(".xterm")).toBeVisible();
});

test("contact button copies plain contact details", async ({ page }) => {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);

  await page.goto("/");
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  await expect(page.locator(".xterm")).toBeVisible();
  await page.getByRole("button", { name: "Copy email contact details" }).click();

  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(contactText);
  await expect(page.getByRole("button", { name: "Copied email contact details" })).toBeVisible();
});

test("assistant does not show the prompt before model status resolves", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window.navigator, "gpu", {
      configurable: true,
      value: undefined,
    });
  });

  await page.goto("/");
  const rows = page.locator(".xterm-rows");
  await expect(rows).toContainText("WebGPU is not available");
  await expect(rows).toContainText("recruiter>");

  const terminalText = await rows.innerText();
  expect(terminalText.indexOf("WebGPU is not available")).toBeGreaterThan(-1);
  expect(terminalText.indexOf("recruiter>")).toBeGreaterThan(
    terminalText.indexOf("WebGPU is not available"),
  );
});

test("send_email tool prints plain contact details", async ({ page }) => {
  await page.goto("/?noai=1");
  await expect(page.locator(".xterm")).toBeVisible();
  await page.getByTestId("recruiter-terminal").click();
  await page.keyboard.type("email");
  await page.keyboard.press("Enter");

  const rows = page.locator(".xterm-rows");
  await expect(rows).toContainText("Email Eugene:");
  await expect(rows).toContainText("Email: emirotin@gmail.com");
  await expect(rows).toContainText("Subject: From CV");
});

test("natural contact request prints plain contact details without waiting for the model", async ({
  page,
}) => {
  await page.goto("/?noai=1");
  await expect(page.locator(".xterm")).toBeVisible();
  await page.getByTestId("recruiter-terminal").click();
  await page.keyboard.type("how can I contact him?");
  await page.keyboard.press("Enter");

  const rows = page.locator(".xterm-rows");
  await expect(rows).toContainText("Email Eugene:");
  await expect(rows).toContainText("Email: emirotin@gmail.com");
  await expect(rows).toContainText("Subject: From CV");
});

test("eval page renders copyable report without auto-running in manual mode", async ({ page }) => {
  test.skip(runsAgainstPreview, "eval route is local dev only");

  await page.goto("/eval?manual=1");
  await expect(page.getByRole("heading", { name: "CV Assistant Model Evaluation" })).toBeVisible();
  await expect(
    page.locator("label").filter({ hasText: "Current baseline: Qwen2.5 0.5B q4f32" }),
  ).toBeVisible();
  await expect(page.locator("textarea")).toContainText("WebLLM CV Assistant Eval");
});

test("eval page is unavailable outside local dev @prod", async ({ page }) => {
  test.skip(!runsAgainstPreview, "production preview only");

  const response = await page.goto("/eval?manual=1");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "CV Assistant Model Evaluation" })).toHaveCount(0);
});
