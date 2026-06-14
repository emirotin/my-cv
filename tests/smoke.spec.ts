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

test("send_email tool prints a mailto link", async ({ page }) => {
  await page.goto("/?noai=1");
  await expect(page.locator(".xterm")).toBeVisible();
  await page.getByTestId("recruiter-terminal").click();
  await page.keyboard.type("email");
  await page.keyboard.press("Enter");

  await expect(page.locator(".xterm-rows")).toContainText(
    "Email Eugene: mailto:emirotin@gmail.com?Subject=From+CV",
  );
});

test("natural contact request prints a mailto link without waiting for the model", async ({
  page,
}) => {
  await page.goto("/?noai=1");
  await expect(page.locator(".xterm")).toBeVisible();
  await page.getByTestId("recruiter-terminal").click();
  await page.keyboard.type("how can I contact him?");
  await page.keyboard.press("Enter");

  await expect(page.locator(".xterm-rows")).toContainText(
    "Email Eugene: mailto:emirotin@gmail.com?Subject=From+CV",
  );
});

test("eval page renders copyable report without auto-running in manual mode", async ({ page }) => {
  await page.goto("/eval?manual=1");
  await expect(page.getByRole("heading", { name: "CV Assistant Model Evaluation" })).toBeVisible();
  await expect(
    page.locator("label").filter({ hasText: "Current baseline: Qwen2.5 0.5B q4f32" }),
  ).toBeVisible();
  await expect(page.locator("textarea")).toContainText("WebLLM CV Assistant Eval");
});
