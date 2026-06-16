import { expect, test } from "@playwright/test";

const contactText = "Email: emirotin@gmail.com\nSubject: From CV";
const runsAgainstPreview = process.env.PLAYWRIGHT_SERVER === "preview";

test("cv route returns server-rendered html", async ({ page }) => {
  const response = await page.goto("/cv");
  expect(response?.ok()).toBe(true);
  expect(await response?.text()).toContain("<h1");
  await expect(page.getByRole("heading", { exact: true, name: "Eugene Mirotin" })).toBeVisible();
  await expect(page.getByText("Staff Software Engineer")).toBeVisible();
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);

  const downloadLink = page
    .locator('a[download="eugene_mirotin_cv.pdf"]')
    .filter({ hasText: "Download PDF" });
  await expect(downloadLink).toBeVisible();
  await expect(downloadLink).toHaveAttribute("download", "eugene_mirotin_cv.pdf");
  await expect(downloadLink).toHaveAttribute("href", /eugene_mirotin_cv.*\.pdf/);
});

test("client navigation to cv route renders cv contents @prod", async ({ page }) => {
  await page.goto("/?noai=1");
  await page.getByRole("button", { exact: true, name: "CV" }).click();

  await expect(page).toHaveURL(/\/cv$/);
  await expect(page.getByRole("heading", { exact: true, name: "Eugene Mirotin" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "CV sections" })).toContainText("Profile");
});

test("unknown route renders the app not found page", async ({ page }) => {
  await page.goto("/missing-route");

  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await expect(page.getByText("This CV assistant does not have a page")).toBeVisible();
  await expect(page.getByRole("button", { name: "Assistant" })).toBeVisible();
  await expect(page.locator("p").filter({ hasText: "Not Found" })).toHaveCount(0);
});

test("terminal runs the ASCII portrait startup program and shows the assistant menu", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Eugene Mirotin CV" })).toBeVisible();
  await expect(page.getByTestId("recruiter-terminal")).toBeVisible();
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText(
    "Welcome to Eugene Mirotin's interactive CV terminal.",
  );
  await expect(page.locator(".xterm-rows")).not.toContainText("program exited 0");
  await expect(page.locator(".xterm-rows")).toContainText("> 1. See CV");
  await expect(page.locator(".xterm-rows")).toContainText("2. Send email");
  await expect(page.locator(".xterm-rows")).toContainText("3. Launch interactive LLM assistant");

  const downloadLink = page
    .locator('a[download="eugene_mirotin_cv.pdf"]')
    .filter({ hasText: "Download PDF" });
  await expect(downloadLink).toBeVisible();
  await expect(downloadLink).toHaveAttribute("download", "eugene_mirotin_cv.pdf");
  await expect(downloadLink).toHaveAttribute("href", /eugene_mirotin_cv.*\.pdf/);
});

test("desktop assistant terminal follows the right column height", async ({ page }) => {
  await page.setViewportSize({ height: 900, width: 1280 });
  await page.goto("/?noai=1");
  await expect(page.locator(".xterm")).toBeVisible();

  const heights = await page.evaluate(() => {
    const terminal = document.querySelector<HTMLElement>('[data-testid="recruiter-terminal"]');
    const sidebar = document.querySelector<HTMLElement>("aside");
    const sidebarCards = Array.from(
      document.querySelectorAll<HTMLElement>('aside > [data-slot="card"]'),
    );

    const firstCard = sidebarCards[0];
    const lastCard = sidebarCards.at(-1) ?? firstCard;

    if (!terminal || !sidebar || !firstCard || !lastCard) {
      throw new Error("Home layout elements were not rendered.");
    }

    const terminalBox = terminal.getBoundingClientRect();
    const sidebarBox = sidebar.getBoundingClientRect();
    const firstCardBox = firstCard.getBoundingClientRect();
    const lastCardBox = lastCard.getBoundingClientRect();

    return {
      sidebar: sidebarBox.height,
      sidebarContent: lastCardBox.bottom - firstCardBox.top,
      terminal: terminalBox.height,
    };
  });

  expect(Math.abs(heights.terminal - heights.sidebarContent)).toBeLessThanOrEqual(2);
  expect(Math.abs(heights.sidebar - heights.sidebarContent)).toBeLessThanOrEqual(2);
});

test("mobile assistant terminal uses a portrait that fits the narrow xterm surface", async ({
  page,
}) => {
  await page.setViewportSize({ height: 800, width: 375 });
  await page.goto("/?noai=1");

  const rows = page.locator(".xterm-rows");
  await expect(rows).toContainText("$ ascii-portrait --matrix 37x16");
  await expect(rows).not.toContainText("program exited 0");

  const metrics = await page.evaluate(() => {
    const xterm = document.querySelector<HTMLElement>(".xterm");
    const screen = document.querySelector<HTMLElement>(".xterm-screen");
    const textarea = document.querySelector<HTMLElement>(".xterm-helper-textarea");

    if (!xterm || !screen || !textarea) {
      throw new Error("Terminal measurement elements were not rendered.");
    }

    const cellWidth = textarea.getBoundingClientRect().width;
    const screenWidth = screen.getBoundingClientRect().width;

    return {
      cellWidth,
      cols: Math.floor(screenWidth / cellWidth),
      paddingRight: window.getComputedStyle(xterm).paddingRight,
      portraitPixelWidth: 37 * cellWidth,
      screenWidth,
    };
  });

  expect(metrics.paddingRight).toBe("0px");
  expect(metrics.cols).toBeGreaterThanOrEqual(37);
  expect(metrics.portraitPixelWidth).toBeLessThanOrEqual(metrics.screenWidth + 0.5);
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

test("terminal menu numeric choice 1 navigates to the cv route", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".xterm")).toBeVisible();
  await page.getByTestId("recruiter-terminal").click();
  await page.keyboard.press("1");

  await expect(page).toHaveURL(/\/cv$/);
  await expect(page.getByRole("heading", { exact: true, name: "Eugene Mirotin" })).toBeVisible();
});

test("terminal menu numeric choice 2 prints contact details", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".xterm")).toBeVisible();
  await page.getByTestId("recruiter-terminal").click();
  await page.keyboard.press("2");

  const rows = page.locator(".xterm-rows");
  await expect(rows).toContainText("Email Eugene:");
  await expect(rows).toContainText("Email: emirotin@gmail.com");
  await expect(rows).toContainText("Subject: From CV");
});

test("terminal menu arrow selection can print contact details", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".xterm")).toBeVisible();
  await page.getByTestId("recruiter-terminal").click();
  await page.keyboard.press("ArrowDown");
  await expect(page.locator(".xterm-rows")).toContainText("> 2. Send email");
  await page.keyboard.press("Enter");

  const rows = page.locator(".xterm-rows");
  await expect(rows).toContainText("Email Eugene:");
  await expect(rows).toContainText("Email: emirotin@gmail.com");
  await expect(rows).toContainText("Subject: From CV");
});

test("terminal menu mouse click can print contact details", async ({ page }) => {
  await page.setViewportSize({ height: 900, width: 1280 });
  await page.goto("/");
  await expect(page.locator(".xterm")).toBeVisible();
  const optionBox = await page.getByText("2. Send email").boundingBox();
  expect(optionBox).not.toBeNull();

  const clickX = optionBox!.x + optionBox!.width / 2;
  const clickY = optionBox!.y + optionBox!.height / 2;
  await page.mouse.move(clickX, clickY);
  await page.mouse.click(clickX, clickY);

  const rows = page.locator(".xterm-rows");
  await expect(rows).toContainText("Email Eugene:");
  await expect(rows).toContainText("Email: emirotin@gmail.com");
  await expect(rows).toContainText("Subject: From CV");
});

test.describe("assistant terminal integration", () => {
  test("assistant does not show the prompt before model status resolves", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window.navigator, "gpu", {
        configurable: true,
        value: undefined,
      });
    });

    await page.goto("/");
    await expect(page.locator(".xterm")).toBeVisible();
    await page.getByTestId("recruiter-terminal").click();
    await page.keyboard.press("3");

    const rows = page.locator(".xterm-rows");
    await expect(rows).toContainText("WebGPU is not available");
    await expect(rows).toContainText("recruiter>");

    const terminalText = await rows.innerText();
    expect(terminalText.indexOf("WebGPU is not available")).toBeGreaterThan(-1);
    expect(terminalText.indexOf("recruiter>")).toBeGreaterThan(
      terminalText.indexOf("WebGPU is not available"),
    );
  });

  test("assistant falls back when WebGPU storage-buffer limit is too low", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window.navigator, "gpu", {
        configurable: true,
        value: {
          requestAdapter: async () => ({
            limits: {
              maxStorageBuffersPerShaderStage: 8,
            },
          }),
        },
      });
    });

    await page.goto("/");
    await expect(page.locator(".xterm")).toBeVisible();
    await page.getByTestId("recruiter-terminal").click();
    await page.keyboard.press("3");

    const rows = page.locator(".xterm-rows");
    await expect(rows).toContainText("storage buffers per shader stage");
    await expect(rows).toContainText("Continuing with CV search fallback");
    await expect(rows).toContainText("recruiter>");
  });

  test("send_email tool prints plain contact details", async ({ page }) => {
    await page.goto("/?noai=1");
    await expect(page.locator(".xterm")).toBeVisible();
    await page.getByTestId("recruiter-terminal").click();
    await page.keyboard.press("3");
    await expect(page.locator(".xterm-rows")).toContainText("recruiter>");
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
    await page.keyboard.press("3");
    await expect(page.locator(".xterm-rows")).toContainText("recruiter>");
    await page.keyboard.type("how can I contact him?");
    await page.keyboard.press("Enter");

    const rows = page.locator(".xterm-rows");
    await expect(rows).toContainText("Email Eugene:");
    await expect(rows).toContainText("Email: emirotin@gmail.com");
    await expect(rows).toContainText("Subject: From CV");
  });
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
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "CV Assistant Model Evaluation" })).toHaveCount(0);
});
