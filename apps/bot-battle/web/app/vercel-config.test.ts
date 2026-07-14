import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Vercel install configuration", () => {
  it("runs the pinned Yarn version through Corepack", () => {
    const configPath = path.resolve(__dirname, "../vercel.json");

    expect(
      existsSync(configPath),
      "BotBattle needs a Vercel install override that bypasses Yarn Classic",
    ).toBe(true);

    const config = JSON.parse(readFileSync(configPath, "utf8"));

    expect(config.installCommand).toBe("corepack yarn install --immutable");
  });
});
