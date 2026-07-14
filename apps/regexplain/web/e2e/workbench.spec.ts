import { expect, test, type Locator, type Page } from "@playwright/test";

const patternInput = (page: Page) =>
  page.getByRole("textbox", { name: "Pattern" });
const flagsInput = (page: Page) => page.getByRole("textbox", { name: "Flags" });
const explainButton = (page: Page) =>
  page.getByRole("button", { name: "Explain regex" });

async function fillRegex(page: Page, pattern: string, flags: string) {
  await patternInput(page).fill(pattern);
  await flagsInput(page).fill(flags);
}

async function expectWithinViewportWidth(locator: Locator, page: Page) {
  const box = await locator.boundingBox();
  const viewport = page.viewportSize();

  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width + 0.5);
}

test("shows loading and submits the exact pattern and flags before a delayed success", async ({
  page,
}) => {
  let releaseResponse!: () => void;
  const responseGate = new Promise<void>((resolve) => {
    releaseResponse = resolve;
  });
  let requestMethod: string | undefined;
  let requestBody: unknown;

  await page.route("**/api/explain", async (route) => {
    requestMethod = route.request().method();
    requestBody = route.request().postDataJSON();
    await responseGate;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        summary: "Matches one or more ASCII letters across the whole string.",
      }),
    });
  });

  await page.goto("/");
  await fillRegex(page, "^[a-z]+$", "i");
  await explainButton(page).click();

  await expect(page.getByRole("status")).toHaveText("Generating AI summary…");
  await expect(explainButton(page)).toBeDisabled();
  await expect.poll(() => requestMethod).toBe("POST");
  expect(requestBody).toEqual({ pattern: "^[a-z]+$", flags: "i" });

  releaseResponse();

  await expect(page.getByRole("status")).toHaveText("AI summary ready.");
  await expect(page.getByRole("region", { name: "AI summary" })).toContainText(
    "Matches one or more ASCII letters across the whole string.",
  );
});

test("retains the workbench and local tools after a stable upstream error", async ({
  page,
}) => {
  let requestBody: unknown;

  await page.route("**/api/explain", async (route) => {
    requestBody = route.request().postDataJSON();
    await route.fulfill({
      status: 502,
      contentType: "application/json",
      body: JSON.stringify({
        error: {
          code: "upstream_error",
          message: "The explanation service is temporarily unavailable.",
        },
      }),
    });
  });

  await page.goto("/");
  await fillRegex(page, "a+", "i");
  await explainButton(page).click();

  await expect(
    page.getByRole("region", { name: "AI summary" }).getByRole("alert"),
  ).toHaveText("The explanation service is temporarily unavailable.");
  expect(requestBody).toEqual({ pattern: "a+", flags: "i" });
  await expect(patternInput(page)).toHaveValue("a+");
  await expect(flagsInput(page)).toHaveValue("i");
  await expect(
    page.getByRole("region", { name: "Local syntax map" }),
  ).toBeVisible();

  const sampleInput = page.getByRole("textbox", { name: "Sample string" });
  await sampleInput.fill("A aa");
  await expect(page.getByText("2 matches found.")).toBeVisible();
});

test("supports keyboard token details and exposes the exact support destination", async ({
  page,
}) => {
  await page.goto("/");
  await patternInput(page).fill("^a+$");

  const firstToken = page.getByRole("button", { name: "Token 1: ^" });
  await firstToken.focus();
  await page.keyboard.press("Enter");

  await expect(firstToken).toBeFocused();
  await expect(firstToken).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("region", { name: "Selected token description" }),
  ).toHaveText("^: Start of string");

  const supportLink = page.getByRole("link", { name: "Support Regexplain" });
  await expect(supportLink).toHaveAttribute(
    "href",
    "https://buymeacoffee.com/nicbarnes",
  );
  await expect(supportLink).toHaveAttribute("target", "_blank");
  await expect(supportLink).toHaveAttribute("rel", "noopener noreferrer");
});

test("keeps the 320px workbench controls usable without document overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");

  const workbench = page.getByRole("region", { name: "Regex workbench" });
  const controls = [
    workbench,
    patternInput(page),
    flagsInput(page),
    explainButton(page),
  ];

  await workbench.scrollIntoViewIfNeeded();
  await expect(workbench).toBeInViewport();
  for (const control of controls) {
    await control.scrollIntoViewIfNeeded();
    await expect(control).toBeVisible();
    await expect(control).toBeInViewport();
    await expectWithinViewportWidth(control, page);
  }

  await patternInput(page).fill("a".repeat(1_000));
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);

  await patternInput(page).focus();
  await expect(patternInput(page)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(flagsInput(page)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(explainButton(page)).toBeFocused();
});

test("captures mobile and desktop production screenshots", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: "/tmp/regexplain-mobile.png",
    fullPage: true,
  });

  await page.setViewportSize({ width: 1_440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: "/tmp/regexplain-desktop.png",
    fullPage: true,
  });
});
