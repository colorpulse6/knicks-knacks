import { describe, expect, it } from "vitest";

import playwrightConfig from "../../playwright.config";

describe("Playwright production server isolation", () => {
  it("starts a fresh server on the same host and port used by the browser", () => {
    const productionUrl = "http://127.0.0.1:3010";

    expect(playwrightConfig.use).toEqual(
      expect.objectContaining({ baseURL: productionUrl }),
    );
    expect(playwrightConfig.webServer).toEqual(
      expect.objectContaining({
        command: "npm run start -- -p 3010",
        url: productionUrl,
        reuseExistingServer: false,
      }),
    );
  });
});
